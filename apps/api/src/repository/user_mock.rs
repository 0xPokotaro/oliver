/// モック用ユーザーリポジトリ（開発環境用）

use crate::error::ApiError;
use crate::models::db::{DbBalance, DbPurchase, DbUserLegacy};
use sqlx::PgPool;

/// モック用ユーザー情報取得（開発環境用）
#[allow(dead_code)]
pub async fn find_by_id_mock(
    _pool: &PgPool,
    user_id: &str,
) -> Result<Option<DbUserLegacy>, ApiError> {
    // user_12345 のみ存在するとする
    if user_id == "user_12345" {
        Ok(Some(DbUserLegacy {
            user_id: user_id.to_string(),
            wallet_id: "0x1234567890abcdef1234567890abcdef12345678".to_string(),
        }))
    } else {
        Ok(None)
    }
}

/// モック用残高取得（開発環境用）
#[allow(dead_code)]
pub async fn find_balances_by_user_id_mock(
    _pool: &PgPool,
    user_id: &str,
) -> Result<Vec<DbBalance>, ApiError> {
    if user_id == "user_12345" {
        Ok(vec![
            DbBalance {
                currency: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913".to_string(),
                currency_name: "USDC".to_string(),
                balance: "1000000000".to_string(),
                decimals: 6,
            },
            DbBalance {
                currency: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".to_string(),
                currency_name: "JPYC".to_string(),
                balance: "500000000000000000000".to_string(),
                decimals: 18,
            },
        ])
    } else {
        Ok(vec![])
    }
}

/// モック用購入履歴取得（開発環境用）
#[allow(dead_code)]
pub async fn find_purchases_by_user_id_mock(
    _pool: &PgPool,
    user_id: &str,
    limit: i32,
) -> Result<Vec<DbPurchase>, ApiError> {
    if user_id == "user_12345" {
        let purchases = vec![
            DbPurchase {
                order_id: "ord_20251222_abc123".to_string(),
                sku: "cat-food-rc-2kg".to_string(),
                product_name: "Royal Canin Indoor 2kg".to_string(),
                quantity: 1,
                amount: "3000500".to_string(),
                currency: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913".to_string(),
                status: "delivered".to_string(),
                purchased_at: chrono::Utc::now() - chrono::Duration::days(3),
            },
            DbPurchase {
                order_id: "ord_20251220_xyz789".to_string(),
                sku: "water-2l-box".to_string(),
                product_name: "Mineral Water 2L x 6".to_string(),
                quantity: 2,
                amount: "1600500".to_string(),
                currency: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913".to_string(),
                status: "shipped".to_string(),
                purchased_at: chrono::Utc::now() - chrono::Duration::days(5),
            },
        ];

        let limited_purchases: Vec<_> = purchases
            .into_iter()
            .take(limit as usize)
            .collect();

        Ok(limited_purchases)
    } else {
        Ok(vec![])
    }
}
