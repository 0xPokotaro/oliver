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
            SELECT id, sku, name, description, price, currency, "stockStatus", "imageUrl", category, attributes
            FROM products
            ORDER BY "createdAt" DESC
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
            SELECT id, sku, name, description, price, currency, "stockStatus", "imageUrl", category, attributes
            FROM products
            WHERE category = $1
            ORDER BY "createdAt" DESC
            "#,
        )
        .bind(category)
        .fetch_all(pool)
        .await
        .map_err(ApiError::from)
    }

    /// SKUで商品を取得
    pub async fn find_by_sku(
        pool: &PgPool,
        sku: &str,
    ) -> Result<Option<DbProduct>, ApiError> {
        sqlx::query_as::<_, DbProduct>(
            r#"
            SELECT id, sku, name, description, price, currency, "stockStatus", "imageUrl", category, attributes
            FROM products
            WHERE sku = $1
            "#,
        )
        .bind(sku)
        .fetch_optional(pool)
        .await
        .map_err(ApiError::from)
    }
}

