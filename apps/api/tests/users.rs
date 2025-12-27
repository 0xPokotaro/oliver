/// ユーザーハンドラーの統合テスト

use axum::{
    body::{Body, to_bytes},
    http::{header, Request, StatusCode},
    routing::get,
    Router,
};
use api::handlers::users::get_user_profile;
use api::models::UserInformation;
use api::state::AppState;
use serde_json::Value;
use tower::ServiceExt;

mod common;
use common::{cleanup_test_data, create_test_state, get_test_db_pool, setup_test_data};

const MAX_BODY_SIZE: usize = 4096;

/// テスト用のRouterを作成
fn create_test_app(state: AppState) -> Router {
    Router::new()
        .route("/api/v1/user/profile", get(get_user_profile))
        .with_state(state)
}

#[tokio::test]
async fn test_get_user_profile_success() {
    let pool = match get_test_db_pool().await {
        Ok(pool) => pool,
        Err(_) => {
            eprintln!("Skipping test: database not available");
            return;
        }
    };
    setup_test_data(&pool).await.unwrap();

    let state = create_test_state(pool.clone());
    let app = create_test_app(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/user/profile")
                .header(header::AUTHORIZATION, "Bearer user_12345")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(json["userId"], "user_12345");
    assert_eq!(json["walletId"], "0x1234567890abcdef1234567890abcdef12345678");
    assert!(json["balances"].is_array());
    assert!(json["purchaseHistory"].is_array());

    let balances = json["balances"].as_array().unwrap();
    assert!(balances.len() >= 2);

    let purchase_history = json["purchaseHistory"].as_array().unwrap();
    assert!(purchase_history.len() >= 1);

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_user_profile_success_with_include_history_false() {
    let pool = match get_test_db_pool().await {
        Ok(pool) => pool,
        Err(_) => {
            eprintln!("Skipping test: database not available");
            return;
        }
    };
    setup_test_data(&pool).await.unwrap();

    let state = create_test_state(pool.clone());
    let app = create_test_app(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/user/profile?includeHistory=false")
                .header(header::AUTHORIZATION, "Bearer user_12345")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let user_info: UserInformation = serde_json::from_slice(&body).unwrap();

    assert_eq!(user_info.user_id, "user_12345");
    assert_eq!(user_info.wallet_id, "0x1234567890abcdef1234567890abcdef12345678");
    assert!(user_info.balances.len() >= 2);
    assert_eq!(user_info.purchase_history.len(), 0);

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_user_profile_success_with_history_limit() {
    let pool = match get_test_db_pool().await {
        Ok(pool) => pool,
        Err(_) => {
            eprintln!("Skipping test: database not available");
            return;
        }
    };
    setup_test_data(&pool).await.unwrap();

    let state = create_test_state(pool.clone());
    let app = create_test_app(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/user/profile?historyLimit=1")
                .header(header::AUTHORIZATION, "Bearer user_12345")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let user_info: UserInformation = serde_json::from_slice(&body).unwrap();

    assert_eq!(user_info.user_id, "user_12345");
    assert!(user_info.purchase_history.len() <= 1);

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_user_profile_unauthorized_no_header() {
    let pool = match get_test_db_pool().await {
        Ok(pool) => pool,
        Err(_) => {
            eprintln!("Skipping test: database not available");
            return;
        }
    };
    setup_test_data(&pool).await.unwrap();

    let state = create_test_state(pool.clone());
    let app = create_test_app(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/user/profile")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(json["error"], "Unauthorized");
    assert_eq!(json["code"], "UNAUTHORIZED");

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_user_profile_unauthorized_invalid_format() {
    let pool = match get_test_db_pool().await {
        Ok(pool) => pool,
        Err(_) => {
            eprintln!("Skipping test: database not available");
            return;
        }
    };
    setup_test_data(&pool).await.unwrap();

    let state = create_test_state(pool.clone());
    let app = create_test_app(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/user/profile")
                .header(header::AUTHORIZATION, "InvalidFormat user_12345")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(json["error"], "Unauthorized");
    assert_eq!(json["code"], "UNAUTHORIZED");

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_user_profile_unauthorized_empty_token() {
    let pool = match get_test_db_pool().await {
        Ok(pool) => pool,
        Err(_) => {
            eprintln!("Skipping test: database not available");
            return;
        }
    };
    setup_test_data(&pool).await.unwrap();

    let state = create_test_state(pool.clone());
    let app = create_test_app(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/user/profile")
                .header(header::AUTHORIZATION, "Bearer ")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(json["error"], "Unauthorized");
    assert_eq!(json["code"], "UNAUTHORIZED");

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_user_profile_not_found() {
    let pool = match get_test_db_pool().await {
        Ok(pool) => pool,
        Err(_) => {
            eprintln!("Skipping test: database not available");
            return;
        }
    };
    setup_test_data(&pool).await.unwrap();

    let state = create_test_state(pool.clone());
    let app = create_test_app(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/user/profile")
                .header(header::AUTHORIZATION, "Bearer nonexistent_user")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(json["error"], "User not found");
    assert_eq!(json["code"], "USER_NOT_FOUND");

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_user_profile_validation_error_history_limit_too_low() {
    let pool = match get_test_db_pool().await {
        Ok(pool) => pool,
        Err(_) => {
            eprintln!("Skipping test: database not available");
            return;
        }
    };
    setup_test_data(&pool).await.unwrap();

    let state = create_test_state(pool.clone());
    let app = create_test_app(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/user/profile?historyLimit=0")
                .header(header::AUTHORIZATION, "Bearer user_12345")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(json["code"], "VALIDATION_ERROR");
    assert!(json["error"].as_str().unwrap().contains("historyLimit"));

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_user_profile_validation_error_history_limit_too_high() {
    let pool = match get_test_db_pool().await {
        Ok(pool) => pool,
        Err(_) => {
            eprintln!("Skipping test: database not available");
            return;
        }
    };
    setup_test_data(&pool).await.unwrap();

    let state = create_test_state(pool.clone());
    let app = create_test_app(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/user/profile?historyLimit=101")
                .header(header::AUTHORIZATION, "Bearer user_12345")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(json["code"], "VALIDATION_ERROR");
    assert!(json["error"].as_str().unwrap().contains("historyLimit"));

    cleanup_test_data(&pool).await.unwrap();
}

