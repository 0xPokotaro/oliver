use axum::{extract::{Path, Query, State}, http::HeaderMap, response::Response, Json};
use crate::error::{ApiError, error_codes};
use crate::models::{GetProductsQuery, Product, ProductDetail, BuyRequest, mapper::{db_product_to_api_product, db_product_to_product_detail}};
use crate::repository::product::{find_all, find_by_category, find_by_id};
use crate::services::payment::{estimate_payment, process_payment};
use crate::state::AppState;

/// GET /api/v1/products ハンドラー
pub async fn get_products(
    State(state): State<AppState>,
    Query(query): Query<GetProductsQuery>,
) -> Result<Json<Vec<Product>>, ApiError> {
    // データベースから商品を取得
    let db_products = if let Some(ref category) = query.category {
        find_by_category(&state.db_pool, category).await?
    } else {
        find_all(&state.db_pool).await?
    };

    // DbProductからProductへ変換
    let products: Vec<_> = db_products
        .into_iter()
        .map(db_product_to_api_product)
        .collect();

    Ok(Json(products))
}

/// GET /api/v1/products/:id ハンドラー
pub async fn get_product_by_id(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ProductDetail>, ApiError> {
    // データベースから商品を取得
    let db_product = find_by_id(&state.db_pool, &id)
        .await?
        .ok_or_else(|| ApiError::NotFound {
            resource: "Product".to_string(),
            code: Some(error_codes::PRODUCT_NOT_FOUND.to_string()),
        })?;

    // DbProductからProductDetailへ変換
    let product_detail = db_product_to_product_detail(db_product);

    Ok(Json(product_detail))
}

/// POST /api/v1/products/:id/buy ハンドラー
pub async fn buy_product(
    State(state): State<AppState>,
    Path(id): Path<String>,
    headers: HeaderMap,
    Json(request): Json<BuyRequest>,
) -> Result<Response, ApiError> {
    // 商品情報を取得
    let db_product = find_by_id(&state.db_pool, &id)
        .await?
        .ok_or_else(|| ApiError::NotFound {
            resource: "Product".to_string(),
            code: Some(error_codes::PRODUCT_NOT_FOUND.to_string()),
        })?;

    // X-PAYMENTヘッダーの有無を確認
    let payment_header = headers.get("X-PAYMENT");

    if payment_header.is_none() {
        // シナリオA: 見積もり要求（402 Payment Required）
        return estimate_payment(&state, &id, &request).await;
    }

    // シナリオB: 決済実行
    let payment_header_value = payment_header
        .ok_or_else(|| ApiError::ValidationError {
            message: "X-PAYMENT header is required".to_string(),
        })?
        .to_str()
        .map_err(|_| ApiError::ValidationError {
            message: "Invalid X-PAYMENT header encoding".to_string(),
        })?;

    process_payment(&state, &id, &db_product, &request, payment_header_value).await
}

