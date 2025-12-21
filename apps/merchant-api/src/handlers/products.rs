use axum::{extract::{Path, Query, State}, Json};
use crate::error::ApiError;
use crate::models::{GetProductsQuery, Product, ProductDetail, mapper::{db_product_to_api_product, db_product_to_product_detail}};
use crate::repository::ProductRepository;
use crate::state::AppState;

/// GET /api/v1/products ハンドラー
pub async fn get_products(
    State(state): State<AppState>,
    Query(query): Query<GetProductsQuery>,
) -> Result<Json<Vec<Product>>, ApiError> {
    // データベースから商品を取得
    let db_products = if let Some(ref category) = query.category {
        ProductRepository::find_by_category(&state.db_pool, category).await?
    } else {
        ProductRepository::find_all(&state.db_pool).await?
    };

    // DbProductからProductへ変換
    let products: Vec<_> = db_products
        .into_iter()
        .map(db_product_to_api_product)
        .collect();

    Ok(Json(products))
}

/// GET /api/v1/products/:sku ハンドラー
pub async fn get_product_by_sku(
    State(state): State<AppState>,
    Path(sku): Path<String>,
) -> Result<Json<ProductDetail>, ApiError> {
    // データベースから商品を取得
    let db_product = ProductRepository::find_by_sku(&state.db_pool, &sku)
        .await?
        .ok_or_else(|| ApiError::NotFound {
            resource: "Product".to_string(),
            code: Some("PRODUCT_NOT_FOUND".to_string()),
        })?;

    // DbProductからProductDetailへ変換
    let product_detail = db_product_to_product_detail(db_product);

    Ok(Json(product_detail))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::{Body, to_bytes},
        http::{Request, StatusCode},
        routing::get,
        Router,
    };
    use crate::models::ProductDetail;
    use crate::state::AppState;
    use crate::test_helpers::products as test_helpers;
    use serde_json::Value;
    use tower::ServiceExt;

    const MAX_BODY_SIZE: usize = 4096;

    /// テスト用のRouterを作成
    fn create_test_app(state: AppState) -> Router {
        Router::new()
            .route("/api/v1/products", get(get_products))
            .route("/api/v1/products/:sku", get(get_product_by_sku))
            .with_state(state)
    }


    #[tokio::test]
    async fn test_get_products_success() {
        let pool = match test_helpers::get_test_db_pool().await {
            Ok(pool) => pool,
            Err(_) => {
                eprintln!("Skipping test: database not available");
                return;
            }
        };
        test_helpers::setup_test_data(&pool).await.unwrap();

        let state = test_helpers::create_test_state(pool.clone());
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
        assert!(first_product["sku"].is_string());
        assert!(first_product["name"].is_string());
        assert!(first_product["price"].is_string());
        assert!(first_product["currency"].is_string());
        assert!(first_product["stockStatus"].is_string());
        assert!(first_product["imageUrl"].is_string());

        test_helpers::cleanup_test_data(&pool).await.unwrap();
    }

    #[tokio::test]
    async fn test_get_products_with_category_filter() {
        let pool = match test_helpers::get_test_db_pool().await {
            Ok(pool) => pool,
            Err(_) => {
                eprintln!("Skipping test: database not available");
                return;
            }
        };
        test_helpers::setup_test_data(&pool).await.unwrap();

        let state = test_helpers::create_test_state(pool.clone());
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
            // カテゴリでフィルタされているので、返された商品がcat_foodであることを確認
            // ただし、APIレスポンスにはカテゴリが含まれていないため、返された商品が存在することのみ確認
            assert!(!product.sku.is_empty());
            assert!(!product.name.is_empty());
        }

        // 少なくとも1つの商品が返されることを確認
        assert!(!products.is_empty());

        test_helpers::cleanup_test_data(&pool).await.unwrap();
    }

    #[tokio::test]
    async fn test_get_products_response_structure() {
        let pool = match test_helpers::get_test_db_pool().await {
            Ok(pool) => pool,
            Err(_) => {
                eprintln!("Skipping test: database not available");
                return;
            }
        };
        test_helpers::setup_test_data(&pool).await.unwrap();

        let state = test_helpers::create_test_state(pool.clone());
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
        assert!(!product.sku.is_empty());
        assert!(!product.name.is_empty());
        assert!(!product.price.is_empty());
        assert!(!product.currency.is_empty());
        // stockStatusはStockStatus enumであることを確認
        match product.stock_status {
            crate::models::StockStatus::InStock
            | crate::models::StockStatus::LowStock
            | crate::models::StockStatus::OutOfStock => {}
        }
        assert!(!product.image_url.is_empty());

        test_helpers::cleanup_test_data(&pool).await.unwrap();
    }

    #[tokio::test]
    async fn test_get_products_empty_category() {
        let pool = match test_helpers::get_test_db_pool().await {
            Ok(pool) => pool,
            Err(_) => {
                eprintln!("Skipping test: database not available");
                return;
            }
        };
        test_helpers::setup_test_data(&pool).await.unwrap();

        let state = test_helpers::create_test_state(pool.clone());
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

        test_helpers::cleanup_test_data(&pool).await.unwrap();
    }

    #[tokio::test]
    async fn test_get_product_by_sku_success() {
        let pool = match test_helpers::get_test_db_pool().await {
            Ok(pool) => pool,
            Err(_) => {
                eprintln!("Skipping test: database not available");
                return;
            }
        };
        test_helpers::setup_test_data(&pool).await.unwrap();

        let state = test_helpers::create_test_state(pool.clone());
        let app = create_test_app(state);

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/api/v1/products/test-product-1")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
        let product_detail: ProductDetail = serde_json::from_slice(&body).unwrap();

        assert_eq!(product_detail.sku, "test-product-1");
        assert_eq!(product_detail.name, "Test Product 1");
        assert_eq!(product_detail.description, "Description 1");
        assert_eq!(product_detail.price, "1000000");
        assert_eq!(product_detail.currency, "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
        assert!(product_detail.attributes.is_object());
        assert_eq!(product_detail.allowed_tokens.len(), 1);
        assert_eq!(product_detail.allowed_tokens[0], "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");

        test_helpers::cleanup_test_data(&pool).await.unwrap();
    }

    #[tokio::test]
    async fn test_get_product_by_sku_not_found() {
        let pool = match test_helpers::get_test_db_pool().await {
            Ok(pool) => pool,
            Err(_) => {
                eprintln!("Skipping test: database not available");
                return;
            }
        };
        test_helpers::setup_test_data(&pool).await.unwrap();

        let state = test_helpers::create_test_state(pool.clone());
        let app = create_test_app(state);

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/api/v1/products/nonexistent-sku")
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

        test_helpers::cleanup_test_data(&pool).await.unwrap();
    }

    #[tokio::test]
    async fn test_get_product_by_sku_with_null_attributes() {
        let pool = match test_helpers::get_test_db_pool().await {
            Ok(pool) => pool,
            Err(_) => {
                eprintln!("Skipping test: database not available");
                return;
            }
        };
        test_helpers::setup_test_data(&pool).await.unwrap();

        let state = test_helpers::create_test_state(pool.clone());
        let app = create_test_app(state);

        // attributesがNULLの商品を取得
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/api/v1/products/test-product-2")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body = to_bytes(response.into_body(), MAX_BODY_SIZE).await.unwrap();
        let product_detail: ProductDetail = serde_json::from_slice(&body).unwrap();

        assert_eq!(product_detail.sku, "test-product-2");
        // attributesがNULLの場合は空のJSONオブジェクト{}が返される
        assert!(product_detail.attributes.is_object());
        assert_eq!(product_detail.attributes, serde_json::json!({}));

        test_helpers::cleanup_test_data(&pool).await.unwrap();
    }
}
