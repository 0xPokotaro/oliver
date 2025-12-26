/// ルーティング定義

use axum::{routing::{get, post}, Router};
use crate::handlers;
use crate::state::AppState;

/// アプリケーションのルーターを構築
pub fn create_router(state: AppState) -> Router {
    Router::new()
        // API v1 routes
        .route("/api/v1/health", get(handlers::health::get_health))
        .route("/api/v1/products", get(handlers::products::get_products))
        .route("/api/v1/products/:id", get(handlers::products::get_product_by_id))
        .route("/api/v1/products/:id/buy", post(handlers::products::buy_product))
        .route("/api/v1/orders/:orderId", get(handlers::orders::get_order_by_id))
        .route("/api/v1/users/:userId", get(handlers::users::get_user_by_id))
        .route("/api/v1/users/:userId/voice", post(handlers::users::execute_voice_command))
        .with_state(state)
}

