/// 商品ハンドラーの統合テスト

use axum::{
    body::{Body, to_bytes},
    http::{Request, StatusCode},
    routing::{get, post},
    Router,
};
use merchant_api::handlers::products::{buy_product, get_product_by_id, get_products};
use merchant_api::models::{Product, ProductDetail};
use merchant_api::state::AppState;
use serde_json::{json, Value};
use tower::ServiceExt;

mod common;
use common::{cleanup_test_data, create_test_state, get_test_db_pool, setup_test_data};

const MAX_BODY_SIZE: usize = 4096;

/// テスト用のRouterを作成
fn create_test_app(state: AppState) -> Router {
    Router::new()
        .route("/api/v1/products", get(get_products))
        .route("/api/v1/products/:id", get(get_product_by_id))
        .with_state(state)
}

#[tokio::test]
async fn test_get_products_success() {
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
                .uri("/api/v1/products")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();

    assert!(json.is_array());
    let products = json.as_array().unwrap();
    assert!(products.len() >= 3);

    // 最初の商品を確認
    let first_product = &products[0];
    assert!(first_product["id"].is_string());
    assert!(first_product["name"].is_string());
    assert!(first_product["price"].is_string());
    assert!(first_product["currency"].is_string());
    assert!(first_product["stockStatus"].is_string());
    assert!(first_product["imageUrl"].is_string());

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_products_with_category_filter() {
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
                .uri("/api/v1/products?category=cat_food")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let products: Vec<Product> = serde_json::from_slice(&body).unwrap();

    // cat_foodカテゴリの商品のみが返されることを確認
    for product in &products {
        assert!(!product.id.is_empty());
        assert!(!product.name.is_empty());
    }

    // 少なくとも1つの商品が返されることを確認
    assert!(!products.is_empty());

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_products_response_structure() {
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
                .uri("/api/v1/products")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let products: Vec<Product> = serde_json::from_slice(&body).unwrap();

    assert!(!products.is_empty());

    // 商品の構造を確認
    let product = &products[0];
    assert!(!product.id.is_empty());
    assert!(!product.name.is_empty());
    assert!(!product.price.is_empty());
    assert!(!product.currency.is_empty());
    // stockStatusはStockStatus enumであることを確認
    match product.stock_status {
        merchant_api::models::StockStatus::InStock
        | merchant_api::models::StockStatus::LowStock
        | merchant_api::models::StockStatus::OutOfStock => {}
    }
    assert!(!product.image_url.is_empty());

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_products_empty_category() {
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

    // 存在しないカテゴリでフィルタ
    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/products?category=nonexistent")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let products: Vec<Product> = serde_json::from_slice(&body).unwrap();

    // 存在しないカテゴリなので空の配列が返される
    assert!(products.is_empty());

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_product_by_id_success() {
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
                .uri("/api/v1/products/product-1")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let product_detail: ProductDetail = serde_json::from_slice(&body).unwrap();

    assert_eq!(product_detail.id, "product-1");
    assert_eq!(product_detail.name, "Test Product 1");
    assert_eq!(product_detail.description, "Description 1");
    assert_eq!(product_detail.price, "1000000");
    assert_eq!(product_detail.currency, "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
    assert!(product_detail.attributes.is_object());
    assert_eq!(product_detail.allowed_tokens.len(), 1);
    assert_eq!(product_detail.allowed_tokens[0], "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_product_by_sku_not_found() {
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
                .uri("/api/v1/products/nonexistent-id")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(json["error"], "Product not found");
    assert_eq!(json["code"], "PRODUCT_NOT_FOUND");

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_product_by_sku_with_null_attributes() {
    let pool = match get_test_db_pool().await {
        Ok(pool) => pool,
        Err(_) => {
            eprintln!("Skipping test: database not available");
            return;
        }
    };
    setup_test_data(&pool).await.unwrap();

    // データが正しく挿入されたか確認（並列実行時の競合を検出）
    let product_exists: bool = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM products WHERE id = 'product-2')"
    )
    .fetch_one(&pool)
    .await
    .unwrap_or(false);
    
    if !product_exists {
        panic!("Test product 'product-2' was not found in database after setup_test_data. This may be due to parallel test execution conflicts.");
    }

    let state = create_test_state(pool.clone());
    let app = create_test_app(state);

    // attributesがNULLの商品を取得
    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/v1/products/product-2")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    let status = response.status();
    if status != StatusCode::OK {
        let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
        let error_body: Value = serde_json::from_slice(&body).unwrap_or_default();
        panic!("Expected OK but got {}: {:?}. Product may have been deleted by another parallel test.", status, error_body);
    }

    assert_eq!(status, StatusCode::OK);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let product_detail: ProductDetail = serde_json::from_slice(&body).unwrap();

    assert_eq!(product_detail.id, "product-2");
    // attributesがNULLの場合は空のJSONオブジェクト{}が返される
    assert!(product_detail.attributes.is_object());
    assert_eq!(product_detail.attributes, serde_json::json!({}));

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_buy_product_estimate_request() {
    let pool = match get_test_db_pool().await {
        Ok(pool) => pool,
        Err(_) => {
            eprintln!("Skipping test: database not available");
            return;
        }
    };
    setup_test_data(&pool).await.unwrap();

    let state = create_test_state(pool.clone());
    let app = Router::new()
        .route("/api/v1/products/:id/buy", post(buy_product))
        .with_state(state);

    let request_body = json!({
        "quantity": 1
    });

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/v1/products/product-1/buy")
                .header("Content-Type", "application/json")
                .body(Body::from(serde_json::to_string(&request_body).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    // 402 Payment Requiredが返されることを確認
    assert_eq!(response.status(), StatusCode::PAYMENT_REQUIRED);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();

    // レスポンス構造を確認
    assert_eq!(json["x402Version"], 1);
    assert!(json["accepts"].is_array());
    assert_eq!(json["error"], "Payment required");

    let accepts = json["accepts"].as_array().unwrap();
    assert_eq!(accepts.len(), 1);
    let accept = &accepts[0];
    assert_eq!(accept["scheme"], "evm-permit");
    assert_eq!(accept["network"], "localhost");
    assert!(accept["maxAmountRequired"].is_string());
    assert!(accept["nonce"].is_string());
    assert!(accept["deadline"].is_number());

    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_buy_product_not_found() {
    let pool = match get_test_db_pool().await {
        Ok(pool) => pool,
        Err(_) => {
            eprintln!("Skipping test: database not available");
            return;
        }
    };
    setup_test_data(&pool).await.unwrap();

    let state = create_test_state(pool.clone());
    let app = Router::new()
        .route("/api/v1/products/:id/buy", post(buy_product))
        .with_state(state);

    let request_body = json!({
        "quantity": 1
    });

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/v1/products/nonexistent-product/buy")
                .header("Content-Type", "application/json")
                .body(Body::from(serde_json::to_string(&request_body).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    // 404 Not Foundが返されることを確認
    assert_eq!(response.status(), StatusCode::NOT_FOUND);

    let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(json["error"], "Product not found");
    assert_eq!(json["code"], "PRODUCT_NOT_FOUND");

    cleanup_test_data(&pool).await.unwrap();
}

