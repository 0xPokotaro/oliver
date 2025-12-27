/// ルーティング定義

use axum::{routing::{get, post}, Router};
use tower_http::cors::CorsLayer;
use http::{Method, header, HeaderValue};
use crate::handlers;
use crate::state::AppState;

/// アプリケーションのルーターを構築
pub fn create_router(state: AppState) -> Router {
    // CORS設定
    // allow_credentials(true)を使用する場合、allow_origin(Any)は使用できない
    // 具体的なオリジンを指定する必要がある
    let cors = CorsLayer::new()
        // 開発環境ではNext.jsの開発サーバー（localhost:3000）を許可
        .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
        // 本番環境では環境変数から取得するか、複数のオリジンを許可する場合:
        // .allow_origin("https://yourdomain.com".parse::<HeaderValue>().unwrap())
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        .allow_headers([
            header::CONTENT_TYPE,
            header::AUTHORIZATION,
            header::ACCEPT,
        ])
        .allow_credentials(true);

    Router::new()
        // API v1 routes
        .route("/api/v1/health", get(handlers::health::get_health))
        .route("/api/v1/user/profile", get(handlers::users::get_user_profile))
        .route("/api/v1/products", get(handlers::products::get_products))
        .route("/api/v1/products/:id", get(handlers::products::get_product_by_id))
        .route("/api/v1/products/:id/buy", post(handlers::products::buy_product))
        .route("/api/v1/orders/:orderId", get(handlers::orders::get_order_by_id))
        .route("/api/v1/users/:userId", get(handlers::users::get_user_by_id))
        .route("/api/v1/users/:userId/voice", post(handlers::users::execute_voice_command))
        // Auth routes
        .route("/api/auth/login", post(handlers::auth::login))
        .route("/api/auth/logout", post(handlers::auth::logout))
        .layer(cors)
        .with_state(state)
}

