/// 決済履歴リポジトリ

use crate::error::ApiError;
use crate::models::db::DbPaymentHistory;
use sqlx::PgPool;
use uuid::Uuid;

/// 決済履歴リポジトリトレイト
#[allow(dead_code)] // テストでモック化するために使用
#[async_trait::async_trait]
pub trait PaymentRepository: Send + Sync {
    /// orderIdで決済履歴を取得（Product情報もJOIN）
    async fn find_by_order_id(
        &self,
        pool: &PgPool,
        order_id: &str,
    ) -> Result<Option<DbPaymentHistory>, ApiError>;
    
    /// paymentIdで決済履歴を取得（Nonce重複チェック用）
    async fn find_by_payment_id(
        &self,
        pool: &PgPool,
        payment_id: &str,
    ) -> Result<Option<String>, ApiError>;
    
    /// 決済記録を作成
    async fn create_payment(
        &self,
        pool: &PgPool,
        payment_id: &str,
        payer: &str,
        recipient: &str,
        amount: &str,
        asset: &str,
        network: &str,
        chain_id: i64,
        order_id: Option<&str>,
        product_id: Option<&str>,
        metadata: Option<serde_json::Value>,
    ) -> Result<(), ApiError>;
}

/// デフォルト実装（既存の関数ベースの実装）
#[allow(dead_code)] // テストで使用予定
pub struct DefaultPaymentRepository;

#[async_trait::async_trait]
impl PaymentRepository for DefaultPaymentRepository {
    async fn find_by_order_id(
        &self,
        pool: &PgPool,
        order_id: &str,
    ) -> Result<Option<DbPaymentHistory>, ApiError> {
        find_by_order_id(pool, order_id).await
    }
    
    async fn find_by_payment_id(
        &self,
        pool: &PgPool,
        payment_id: &str,
    ) -> Result<Option<String>, ApiError> {
        find_by_payment_id(pool, payment_id).await
    }
    
    async fn create_payment(
        &self,
        pool: &PgPool,
        payment_id: &str,
        payer: &str,
        recipient: &str,
        amount: &str,
        asset: &str,
        network: &str,
        chain_id: i64,
        order_id: Option<&str>,
        product_id: Option<&str>,
        metadata: Option<serde_json::Value>,
    ) -> Result<(), ApiError> {
        create_payment(
            pool,
            payment_id,
            payer,
            recipient,
            amount,
            asset,
            network,
            chain_id,
            order_id,
            product_id,
            metadata,
        )
        .await
    }
}

/// orderIdで決済履歴を取得（Product情報もJOIN）
pub async fn find_by_order_id(
    pool: &PgPool,
    order_id: &str,
) -> Result<Option<DbPaymentHistory>, ApiError> {
    sqlx::query_as::<_, DbPaymentHistory>(
        r#"
        SELECT 
            ph."orderId",
            ph.status,
            ph.payer,
            ph.amount,
            ph.asset as currency,
            ph."txHash",
            ph."createdAt"::timestamptz as "createdAt",
            ph."settledAt"::timestamptz as "settledAt",
            p.sku as "productSku",
            p.name as "productName"
        FROM payment_history ph
        LEFT JOIN products p ON ph."productId" = p.id
        WHERE ph."orderId" = $1 AND ph."orderId" IS NOT NULL
        "#,
    )
    .bind(order_id)
    .fetch_optional(pool)
    .await
    .map_err(ApiError::from)
}

/// paymentIdで決済履歴を取得（Nonce重複チェック用）
pub async fn find_by_payment_id(
    pool: &PgPool,
    payment_id: &str,
) -> Result<Option<String>, ApiError> {
    let result = sqlx::query_scalar::<_, String>(
        r#"
        SELECT "paymentId"
        FROM payment_history
        WHERE "paymentId" = $1
        "#,
    )
    .bind(payment_id)
    .fetch_optional(pool)
    .await
    .map_err(ApiError::from)?;

    Ok(result)
}

/// 決済記録を作成
pub async fn create_payment(
    pool: &PgPool,
    payment_id: &str,
    payer: &str,
    recipient: &str,
    amount: &str,
    asset: &str,
    network: &str,
    chain_id: i64,
    order_id: Option<&str>,
    product_id: Option<&str>,
    metadata: Option<serde_json::Value>,
) -> Result<(), ApiError> {
    let id = Uuid::new_v4().to_string();

    sqlx::query(
        r#"
        INSERT INTO payment_history (
            id, "paymentId", payer, recipient, amount, asset, network, "chainId",
            status, "orderId", "productId", metadata, "createdAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10, $11, NOW())
        ON CONFLICT ("paymentId") DO NOTHING
        "#,
    )
    .bind(&id)
    .bind(payment_id)
    .bind(payer)
    .bind(recipient)
    .bind(amount)
    .bind(asset)
    .bind(network)
    .bind(chain_id)
    .bind(order_id)
    .bind(product_id)
    .bind(metadata)
    .execute(pool)
    .await
    .map_err(ApiError::from)?;

    Ok(())
}

