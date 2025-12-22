/// ヘルスチェックハンドラーの統合テスト

use axum::{
    body::{Body, to_bytes},
    http::{Request, StatusCode},
    routing::get,
    Router,
};
use merchant_api::handlers::health::{get_health, HealthResponse, API_VERSION};
use serde_json::Value;
use tower::ServiceExt;

const MAX_BODY_SIZE: usize = 4096;

fn create_test_app() -> Router {
    Router::new().route("/api/v1/health", get(get_health))
}

#[tokio::test]
async fn test_health_check_success() {
    let app = create_test_app();

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/health")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(json["status"], "ok");
    assert_eq!(json["version"], API_VERSION);
    assert_eq!(json["chainConnection"], true);
    assert!(json["timestamp"].is_number());
}

#[tokio::test]
async fn test_health_check_response_structure() {
    let app = create_test_app();

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/health")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let health: HealthResponse = serde_json::from_slice(&body).unwrap();

    assert_eq!(health.status, "ok");
    assert_eq!(health.version, API_VERSION);
    assert_eq!(health.chain_connection, true);
    assert!(health.timestamp > 0);
}

