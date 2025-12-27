/// ユーザーリポジトリ

use crate::error::ApiError;
use crate::models::db::{DbBalance, DbPurchase, DbUser, DbUserLegacy};
use sqlx::PgPool;

/// ユーザーリポジトリトレイト
#[allow(dead_code)]
#[async_trait::async_trait]
pub trait UserRepository: Send + Sync {
    /// ユーザーIDでユーザー情報を取得
    async fn find_by_id(&self, pool: &PgPool, user_id: &str) -> Result<Option<DbUserLegacy>, ApiError>;

    /// ユーザーの残高を取得
    async fn find_balances_by_user_id(
        &self,
        pool: &PgPool,
        user_id: &str,
    ) -> Result<Vec<DbBalance>, ApiError>;

    /// ユーザーの購入履歴を取得
    async fn find_purchases_by_user_id(
        &self,
        pool: &PgPool,
        user_id: &str,
        limit: i32,
    ) -> Result<Vec<DbPurchase>, ApiError>;
}

/// デフォルト実装
#[allow(dead_code)]
pub struct DefaultUserRepository;

#[async_trait::async_trait]
impl UserRepository for DefaultUserRepository {
    async fn find_by_id(&self, pool: &PgPool, user_id: &str) -> Result<Option<DbUserLegacy>, ApiError> {
        find_by_id(pool, user_id).await
    }

    async fn find_balances_by_user_id(
        &self,
        pool: &PgPool,
        user_id: &str,
    ) -> Result<Vec<DbBalance>, ApiError> {
        find_balances_by_user_id(pool, user_id).await
    }

    async fn find_purchases_by_user_id(
        &self,
        pool: &PgPool,
        user_id: &str,
        limit: i32,
    ) -> Result<Vec<DbPurchase>, ApiError> {
        find_purchases_by_user_id(pool, user_id, limit).await
    }
}

/// ユーザーをUpsert（存在しない場合は作成、存在する場合は更新）
pub async fn upsert_user(
    pool: &PgPool,
    dynamic_user_id: &str,
    wallet_address: &str,
) -> Result<DbUser, ApiError> {
    sqlx::query_as::<_, DbUser>(
        r#"
        INSERT INTO users (id, "dynamicUserId", "walletAddress", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, $1, $2, NOW(), NOW())
        ON CONFLICT ("dynamicUserId")
        DO UPDATE SET "walletAddress" = EXCLUDED."walletAddress", "updatedAt" = NOW()
        RETURNING id, "dynamicUserId", "walletAddress"
        "#,
    )
    .bind(dynamic_user_id)
    .bind(wallet_address)
    .fetch_one(pool)
    .await
    .map_err(ApiError::from)
}

/// ユーザーIDでユーザー情報を取得
pub async fn find_by_id(
    pool: &PgPool,
    user_id: &str,
) -> Result<Option<DbUserLegacy>, ApiError> {
    #[cfg(feature = "mock-data")]
    {
        return super::user_mock::find_by_id_mock(pool, user_id).await;
    }

    #[cfg(not(feature = "mock-data"))]
    {
        // 本番用SQLクエリ
        sqlx::query_as::<_, DbUserLegacy>(
            r#"
            SELECT user_id, wallet_id
            FROM users
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .fetch_optional(pool)
        .await
        .map_err(ApiError::from)
    }
}

/// ユーザーの残高を取得
pub async fn find_balances_by_user_id(
    pool: &PgPool,
    user_id: &str,
) -> Result<Vec<DbBalance>, ApiError> {
    #[cfg(feature = "mock-data")]
    {
        return super::user_mock::find_balances_by_user_id_mock(pool, user_id).await;
    }

    #[cfg(not(feature = "mock-data"))]
    {
        // 本番用SQLクエリ
        sqlx::query_as::<_, DbBalance>(
            r#"
            SELECT currency, currency_name, balance, decimals
            FROM balances
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .fetch_all(pool)
        .await
        .map_err(ApiError::from)
    }
}

/// ユーザーの購入履歴を取得
pub async fn find_purchases_by_user_id(
    pool: &PgPool,
    user_id: &str,
    limit: i32,
) -> Result<Vec<DbPurchase>, ApiError> {
    #[cfg(feature = "mock-data")]
    {
        return super::user_mock::find_purchases_by_user_id_mock(pool, user_id, limit).await;
    }

    #[cfg(not(feature = "mock-data"))]
    {
        // 本番用SQLクエリ
        sqlx::query_as::<_, DbPurchase>(
            r#"
            SELECT order_id, sku, product_name, quantity, amount, currency, status, purchased_at
            FROM purchases
            WHERE user_id = $1
            ORDER BY purchased_at DESC
            LIMIT $2
            "#,
        )
        .bind(user_id)
        .bind(limit)
        .fetch_all(pool)
        .await
        .map_err(ApiError::from)
    }
}
