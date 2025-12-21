/// 商品リポジトリ

use crate::error::ApiError;
use crate::models::db::DbProduct;
use sqlx::PgPool;

pub struct ProductRepository;

impl ProductRepository {
    /// すべての商品を取得
    pub async fn find_all(pool: &PgPool) -> Result<Vec<DbProduct>, ApiError> {
        sqlx::query_as::<_, DbProduct>(
            r#"
            SELECT id, sku, name, description, price, currency, stock_status, image_url, category
            FROM products
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(pool)
        .await
        .map_err(ApiError::from)
    }

    /// カテゴリで商品を取得
    pub async fn find_by_category(
        pool: &PgPool,
        category: &str,
    ) -> Result<Vec<DbProduct>, ApiError> {
        sqlx::query_as::<_, DbProduct>(
            r#"
            SELECT id, sku, name, description, price, currency, stock_status, image_url, category
            FROM products
            WHERE category = $1
            ORDER BY created_at DESC
            "#,
        )
        .bind(category)
        .fetch_all(pool)
        .await
        .map_err(ApiError::from)
    }
}

