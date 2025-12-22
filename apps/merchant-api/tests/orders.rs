/// 注文ハンドラーの統合テスト

use axum::{
    body::{Body, to_bytes},
    http::{Request, StatusCode},
    routing::get,
    Router,
};
use merchant_api::handlers::orders::get_order_by_id;
use merchant_api::models::Order;
use merchant_api::state::AppState;
use serde_json::Value;
use tower::ServiceExt;

mod common;
use common::{cleanup_test_data, create_test_state, get_test_db_pool, setup_test_data};

const MAX_BODY_SIZE: usize = 4096;

/// テスト用のRouterを作成
fn create_test_app(state: AppState) -> Router {
    Router::new()
        .route("/api/v1/orders/:orderId", get(get_order_by_id))
        .with_state(state)
}

#[tokio::test]
async fn test_get_order_by_id_success() {
    let pool = match get_test_db_pool().await {
        Ok(pool) => pool,
        Err(_) => {
            eprintln!("Skipping test: database not available");
            return;
        }
    };

    // テストデータをセットアップ（merchantとproductsを作成）
    setup_test_data(&pool).await.unwrap();

    // 商品が確実に存在することを確認（並列実行時の競合を検出）
    let product_exists: bool = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM products WHERE id = 'product-1')"
    )
    .fetch_one(&pool)
    .await
    .unwrap_or(false);
    
    if !product_exists {
        panic!("Test product 'product-1' was not found in database after setup_test_data. This may be due to parallel test execution conflicts.");
    }

    // テスト用の決済履歴を挿入
    let order_id = "test-order-1";
    sqlx::query(
        r#"
        INSERT INTO payment_history (id, "paymentId", payer, recipient, amount, asset, network, "chainId", status, "orderId", "productId", "createdAt", "settledAt")
        VALUES 
            ('payment-1', '0xpayment123', '0x1234567890123456789012345678901234567890', '0x9876543210987654321098765432109876543210', '1000000', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'localhost', 31337, 'settled', $1, 'product-1', NOW(), NOW())
        ON CONFLICT ("paymentId") DO UPDATE SET
            status = EXCLUDED.status,
            "orderId" = EXCLUDED."orderId",
            "settledAt" = EXCLUDED."settledAt"
        "#,
    )
    .bind(order_id)
    .execute(&pool)
    .await
    .unwrap();

    let state = create_test_state(pool.clone());
    let app = create_test_app(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri(&format!("/api/v1/orders/{}", order_id))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    let status = response.status();
    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();

    if status != StatusCode::OK {
        let error_body: Value = serde_json::from_slice(&body).unwrap_or_default();
        panic!("Expected OK but got {}: {:?}", status, error_body);
    }

    assert_eq!(status, StatusCode::OK);

    let order: Order = serde_json::from_slice(&body).unwrap();

    assert_eq!(order.order_id, order_id);
    assert_eq!(order.status, merchant_api::models::OrderStatus::Processing);
    assert_eq!(order.amount, "1000000");
    assert!(order.id.is_some());
    assert_eq!(order.quantity, 1);
    assert!(order.tracking_number.is_none());

    // クリーンアップ
    sqlx::query("DELETE FROM payment_history WHERE id = 'payment-1'")
        .execute(&pool)
        .await
        .unwrap();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_order_by_id_not_found() {
    let pool = match get_test_db_pool().await {
        Ok(pool) => pool,
        Err(_) => {
            eprintln!("Skipping test: database not available");
            return;
        }
    };

    let state = create_test_state(pool.clone());
    let app = create_test_app(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/orders/nonexistent-order-id")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(json["error"], "Order not found");
    assert_eq!(json["code"], "ORDER_NOT_FOUND");
}

#[tokio::test]
async fn test_get_order_by_id_pending_status() {
    let pool = match get_test_db_pool().await {
        Ok(pool) => pool,
        Err(_) => {
            eprintln!("Skipping test: database not available");
            return;
        }
    };

    setup_test_data(&pool).await.unwrap();

    let order_id = "test-order-pending";
    sqlx::query(
        r#"
        INSERT INTO payment_history (id, "paymentId", payer, recipient, amount, asset, network, "chainId", status, "orderId", "productId", "createdAt")
        VALUES 
            ('payment-2', '0xpayment456', '0x1234567890123456789012345678901234567890', '0x9876543210987654321098765432109876543210', '2000000', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'localhost', 31337, 'pending', $1, 'product-1', NOW())
        ON CONFLICT ("paymentId") DO UPDATE SET
            status = EXCLUDED.status,
            "orderId" = EXCLUDED."orderId"
        "#,
    )
    .bind(order_id)
    .execute(&pool)
    .await
    .unwrap();

    let state = create_test_state(pool.clone());
    let app = create_test_app(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri(&format!("/api/v1/orders/{}", order_id))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    let status = response.status();
    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();

    if status != StatusCode::OK {
        let error_body: Value = serde_json::from_slice(&body).unwrap_or_default();
        panic!("Expected OK but got {}: {:?}", status, error_body);
    }

    assert_eq!(status, StatusCode::OK);

    let order: Order = serde_json::from_slice(&body).unwrap();

    assert_eq!(order.order_id, order_id);
    assert_eq!(order.status, merchant_api::models::OrderStatus::Processing);
    assert_eq!(order.amount, "2000000");
    assert_eq!(order.quantity, 1);

    // クリーンアップ
    sqlx::query("DELETE FROM payment_history WHERE id = 'payment-2'")
        .execute(&pool)
        .await
        .unwrap();
    cleanup_test_data(&pool).await.unwrap();
}

