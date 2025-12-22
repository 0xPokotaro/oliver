/// 商品リポジトリ

use crate::error::ApiError;
use crate::models::db::DbProduct;
use sqlx::PgPool;

/// 商品リポジトリトレイト
#[allow(dead_code)] // テストでモック化するために使用
#[async_trait::async_trait]
pub trait ProductRepository: Send + Sync {
    /// すべての商品を取得
    async fn find_all(&self, pool: &PgPool) -> Result<Vec<DbProduct>, ApiError>;
    
    /// カテゴリで商品を取得
    async fn find_by_category(
        &self,
        pool: &PgPool,
        category: &str,
    ) -> Result<Vec<DbProduct>, ApiError>;
    
    /// SKUで商品を取得
    async fn find_by_sku(
        &self,
        pool: &PgPool,
        sku: &str,
    ) -> Result<Option<DbProduct>, ApiError>;
}

/// デフォルト実装（既存の関数ベースの実装）
#[allow(dead_code)] // テストで使用予定
pub struct DefaultProductRepository;

#[async_trait::async_trait]
impl ProductRepository for DefaultProductRepository {
    async fn find_all(&self, pool: &PgPool) -> Result<Vec<DbProduct>, ApiError> {
        find_all(pool).await
    }
    
    async fn find_by_category(
        &self,
        pool: &PgPool,
        category: &str,
    ) -> Result<Vec<DbProduct>, ApiError> {
        find_by_category(pool, category).await
    }
    
    async fn find_by_sku(
        &self,
        pool: &PgPool,
        sku: &str,
    ) -> Result<Option<DbProduct>, ApiError> {
        find_by_sku(pool, sku).await
    }
}

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

