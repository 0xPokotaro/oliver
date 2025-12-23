/// x402決済プロトコル関連のユーティリティ関数

use crate::config::X402Config;
use crate::models::{PaymentAccept, PaymentMetadata, PaymentPayload, PaymentRequiredResponse};
use base64::Engine;
use uuid::Uuid;

/// X-PAYMENTヘッダーをデコード・パース
pub fn parse_payment_header(header_value: &str) -> Result<PaymentPayload, String> {
    // Base64デコード
    let decoded = base64::engine::general_purpose::STANDARD
        .decode(header_value)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    // JSONパース
    let payload: PaymentPayload = serde_json::from_slice(&decoded)
        .map_err(|e| format!("Failed to parse payment payload: {}", e))?;

    Ok(payload)
}

/// 合計金額を計算（商品価格 × 数量 + 送料）
pub fn calculate_total_amount(price: i64, quantity: i32, shipping_fee: i64) -> i64 {
    price * (quantity as i64) + shipping_fee
}

/// UUID形式のNonceを生成
pub fn generate_nonce() -> String {
    Uuid::new_v4().to_string()
}

/// 402 Payment Requiredレスポンスを生成
pub fn create_payment_required_response(
    config: &X402Config,
    resource_path: &str,
    max_amount_required: i64,
    subtotal: i64,
    shipping_fee: i64,
    nonce: String,
    deadline: i64,
) -> PaymentRequiredResponse {
    let metadata = PaymentMetadata {
        subtotal: Some(subtotal.to_string()),
        shipping_fee: Some(shipping_fee.to_string()),
        shipping_address_masked: None,
    };

    let accept = PaymentAccept {
        scheme: "evm-permit".to_string(),
        network: config.network.clone(),
        max_amount_required: max_amount_required.to_string(),
        resource: resource_path.to_string(),
        description: config.description.clone(),
        pay_to: config.pay_to.clone(),
        asset: config.asset.clone(),
        max_timeout_seconds: config.max_timeout_seconds as i64,
        chain_id: Some(config.chain_id),
        currency: Some(config.asset.clone()),
        nonce: Some(nonce),
        deadline: Some(deadline),
        metadata: Some(metadata),
    };

    PaymentRequiredResponse {
        x402_version: 1,
        accepts: vec![accept],
        error: "Payment required".to_string(),
    }
}

/// WWW-Authenticateヘッダーを生成
pub fn create_www_authenticate_header(token: &str, price: i64) -> String {
    format!(r#"X402 token="{}", price="{}""#, token, price)
}

