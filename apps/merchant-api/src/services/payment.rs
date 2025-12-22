/// 決済サービス

use axum::{
    http::{HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
};
use chrono::Utc;
use serde_json::json;

use crate::error::{ApiError, PaymentErrorKind};
use crate::models::{
    db::DbProduct,
    BuyRequest, BuyResponse, PaymentInfo,
};
use crate::repository::payment::{create_payment, find_by_payment_id};
use crate::repository::product::find_by_id;
use crate::state::AppState;
use crate::utils::{
    facilitator::{settle_payment, verify_payment},
    order::generate_order_id,
    x402::{
        calculate_total_amount, create_payment_required_response,
        create_www_authenticate_header, parse_payment_header,
    },
};

/// 見積もり要求（402 Payment Required）を処理
pub async fn estimate_payment(
    state: &AppState,
    id: &str,
    request: &BuyRequest,
) -> Result<Response, ApiError> {
    // 商品情報を取得
    let db_product = find_by_id(&state.db_pool, id)
        .await?
        .ok_or_else(|| ApiError::NotFound {
            resource: "Product".to_string(),
            code: Some("PRODUCT_NOT_FOUND".to_string()),
        })?;

    let price = db_product.price;
    let shipping_fee = state.x402_config.shipping_fee;
    let total_amount = calculate_total_amount(price, request.quantity, shipping_fee);

    let nonce = crate::utils::x402::generate_nonce();
    let deadline = Utc::now().timestamp() + (state.x402_config.max_timeout_seconds as i64);
    let resource_path = format!("/api/v1/products/{}/buy", id);

    let response = create_payment_required_response(
        &state.x402_config,
        &resource_path,
        total_amount,
        price * (request.quantity as i64),
        shipping_fee,
        nonce,
        deadline,
    );

    let authenticate_header = create_www_authenticate_header(
        &state.x402_config.asset,
        total_amount,
    );

    Err(ApiError::PaymentRequired {
        response,
        authenticate_header,
    })?;
    unreachable!()
}

/// 決済実行を処理
pub async fn process_payment(
    state: &AppState,
    _id: &str,
    db_product: &DbProduct,
    request: &BuyRequest,
    payment_header_value: &str,
) -> Result<Response, ApiError> {
    // X-PAYMENTヘッダーの形式を検証（Facilitator APIで実際の検証を行うため、ここでは形式チェックのみ）
    parse_payment_header(payment_header_value)
        .map_err(|e| ApiError::ValidationError {
            message: format!("Invalid payment payload: {}", e),
        })?;

    // Facilitator APIで検証
    let verify_result = verify_payment(
        &state.x402_config.facilitator_url,
        payment_header_value,
    )
    .await?;

    // 金額の整合性チェック
    let expected_amount = calculate_total_amount(
        db_product.price,
        request.quantity,
        state.x402_config.shipping_fee,
    );
    let payment_amount: i64 = verify_result.amount.parse().map_err(|e| {
        ApiError::ValidationError {
            message: format!("Invalid amount format: '{}' - {}", verify_result.amount, e),
        }
    })?;

    if payment_amount < expected_amount {
        return Err(ApiError::PaymentError {
            kind: PaymentErrorKind::InsufficientFunds,
            code: "INSUFFICIENT_FUNDS".to_string(),
        });
    }

    // Nonceの重複チェック
    let existing_payment = find_by_payment_id(
        &state.db_pool,
        &verify_result.payment_id,
    )
    .await?;

    if existing_payment.is_some() {
        return Err(ApiError::PaymentError {
            kind: PaymentErrorKind::NonceUsed,
            code: "NONCE_USED".to_string(),
        });
    }

    // 注文IDを生成
    let order_id = generate_order_id();

    // payment_historyテーブルに記録
    create_payment(
        &state.db_pool,
        &verify_result.payment_id,
        &verify_result.payer,
        &state.x402_config.pay_to,
        &verify_result.amount,
        &state.x402_config.asset,
        &state.x402_config.network,
        state.x402_config.chain_id,
        Some(&order_id),
        Some(&db_product.id),
        None,
    )
    .await?;

    // Facilitator APIで決済実行（非同期、Fire-and-Forget）
    let facilitator_url = state.x402_config.facilitator_url.clone();
    let payment_payload_str = payment_header_value.to_string();
    settle_payment(&facilitator_url, &payment_payload_str).await;

    // レスポンスを生成
    let response = BuyResponse {
        status: "success".to_string(),
        order_id,
        message: "Payment accepted. Processing shipment.".to_string(),
        estimated_arrival: None,
        payment: PaymentInfo {
            payment_id: verify_result.payment_id.clone(),
            payer: verify_result.payer.clone(),
            amount: verify_result.amount.clone(),
            tx_hash: None,
        },
    };

    // X-PAYMENT-RESPONSEヘッダーを生成
    let payment_response_json = json!({
        "paymentId": verify_result.payment_id,
        "payer": verify_result.payer,
        "amount": verify_result.amount
    });

    let mut headers = HeaderMap::new();
    if let Ok(header_value) = HeaderValue::from_str(&payment_response_json.to_string()) {
        headers.insert("X-PAYMENT-RESPONSE", header_value);
    }

    Ok((StatusCode::OK, headers, axum::Json(response)).into_response())
}

