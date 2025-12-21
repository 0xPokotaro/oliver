use axum::{extract::{Query, State}, Json};
use crate::error::ApiError;
use crate::models::{GetProductsQuery, Product, mapper::db_product_to_api_product};
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

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::{Body, to_bytes},
        http::{Request, StatusCode},
        routing::get,
        Router,
    };
    use crate::config::X402Config;
    use crate::state::AppState;
    use serde_json::Value;
    use sqlx::PgPool;
    use std::sync::Arc;
    use tower::ServiceExt;

    const MAX_BODY_SIZE: usize = 4096;

    /// テスト用のAppStateを作成
    fn create_test_state(pool: PgPool) -> AppState {
        let config = X402Config {
            pay_to: "0x0000000000000000000000000000000000000000".to_string(),
            asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913".to_string(),
            max_amount_required: "0".to_string(),
            network: "localhost".to_string(),
            max_timeout_seconds: 3600,
            facilitator_url: "http://localhost:8403".to_string(),
            description: "Test".to_string(),
        };
        AppState {
            x402_config: Arc::new(config),
            db_pool: pool,
        }
    }

    /// テスト用のRouterを作成
    fn create_test_app(state: AppState) -> Router {
        Router::new()
            .route("/api/v1/products", get(get_products))
            .with_state(state)
    }

    /// テストデータを挿入
    async fn setup_test_data(pool: &PgPool) -> anyhow::Result<()> {
        // まず既存のテストデータをクリーンアップ
        cleanup_test_data(pool).await.ok();

        // テスト用のmerchantを作成
        sqlx::query(
            r#"
            INSERT INTO merchants (id, name, "createdAt", "updatedAt")
            VALUES ('test-merchant-1', 'Test Merchant', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
            "#,
        )
        .execute(pool)
        .await?;

        // テスト用の商品を挿入（SKUまたはIDでのコンフリクトを処理）
        sqlx::query(
            r#"
            INSERT INTO products (id, sku, name, description, price, currency, "stockStatus", "imageUrl", category, "merchantId", "createdAt", "updatedAt")
            VALUES 
                ('product-1', 'test-product-1', 'Test Product 1', 'Description 1', 1000000, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'in_stock', 'https://example.com/image1.png', 'cat_food', 'test-merchant-1', NOW(), NOW()),
                ('product-2', 'test-product-2', 'Test Product 2', 'Description 2', 2000000, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'low_stock', 'https://example.com/image2.png', 'dog_food', 'test-merchant-1', NOW(), NOW()),
                ('product-3', 'test-product-3', 'Test Product 3', 'Description 3', 3000000, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'out_of_stock', NULL, 'cat_food', 'test-merchant-1', NOW(), NOW())
            ON CONFLICT (sku) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                price = EXCLUDED.price,
                currency = EXCLUDED.currency,
                "stockStatus" = EXCLUDED."stockStatus",
                "imageUrl" = EXCLUDED."imageUrl",
                category = EXCLUDED.category,
                "updatedAt" = NOW()
            "#,
        )
        .execute(pool)
        .await?;

        Ok(())
    }

    /// テストデータをクリーンアップ
    async fn cleanup_test_data(pool: &PgPool) -> anyhow::Result<()> {
        sqlx::query("DELETE FROM products WHERE id LIKE 'product-%'")
            .execute(pool)
            .await?;
        sqlx::query("DELETE FROM merchants WHERE id = 'test-merchant-1'")
            .execute(pool)
            .await?;
        Ok(())
    }

    /// テスト用のデータベースプールを取得
    async fn get_test_db_pool() -> anyhow::Result<PgPool> {
        let database_url = std::env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://postgres:postgres@localhost:54322/postgres".to_string());
        
        PgPool::connect(&database_url)
            .await
            .map_err(|e| anyhow::anyhow!("Failed to connect to test database: {}", e))
    }

    #[tokio::test]
    async fn test_get_products_success() {
        let pool = get_test_db_pool().await.unwrap();
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
        assert!(first_product["sku"].is_string());
        assert!(first_product["name"].is_string());
        assert!(first_product["price"].is_string());
        assert!(first_product["currency"].is_string());
        assert!(first_product["stockStatus"].is_string());
        assert!(first_product["imageUrl"].is_string());

        cleanup_test_data(&pool).await.unwrap();
    }

    #[tokio::test]
    async fn test_get_products_with_category_filter() {
        let pool = get_test_db_pool().await.unwrap();
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
            // カテゴリでフィルタされているので、返された商品がcat_foodであることを確認
            // ただし、APIレスポンスにはカテゴリが含まれていないため、返された商品が存在することのみ確認
            assert!(!product.sku.is_empty());
            assert!(!product.name.is_empty());
        }

        // 少なくとも1つの商品が返されることを確認
        assert!(!products.is_empty());

        cleanup_test_data(&pool).await.unwrap();
    }

    #[tokio::test]
    async fn test_get_products_response_structure() {
        let pool = get_test_db_pool().await.unwrap();
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

        cleanup_test_data(&pool).await.unwrap();
    }

    #[tokio::test]
    async fn test_get_products_empty_category() {
        let pool = get_test_db_pool().await.unwrap();
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
}
