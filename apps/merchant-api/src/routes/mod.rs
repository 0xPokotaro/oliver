/// ルーティング定義

use axum::{routing::get, Router};
use crate::handlers;
use crate::state::AppState;

/// アプリケーションのルーターを構築
pub fn create_router(state: AppState) -> Router {
    Router::new()
        // API v1 routes
        .route("/api/v1/health", get(handlers::health::get_health))
        .route("/api/v1/products", get(handlers::products::get_products))
        .route("/api/v1/products/:sku", get(handlers::products::get_product_by_sku))
        // x402 routes
        .route("/api/x402/resource", get(handlers::resource::get_resource))
        .with_state(state)
}

