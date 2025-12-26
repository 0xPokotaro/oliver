/// データベース型

use sqlx::FromRow;
use chrono::{DateTime, Utc};

/// データベースから取得するProduct型
#[derive(Debug, FromRow)]
#[allow(dead_code)] // id, description, category は将来使用する可能性があるため
pub struct DbProduct {
    pub id: String,
    pub name: String,
    pub description: String,
    pub price: i64, // BigIntはi64として扱う
    pub currency: String,
    #[sqlx(rename = "stockStatus")]
    pub stock_status: String,
    #[sqlx(rename = "imageUrl")]
    pub image_url: Option<String>,
    pub category: Option<String>,
    pub attributes: Option<serde_json::Value>, // JSON型（NULL許可）
}

/// データベースから取得するPaymentHistory型（Order取得用）
#[derive(Debug, FromRow)]
#[allow(dead_code)] // 一部のフィールドは将来使用する可能性があるため
pub struct DbPaymentHistory {
    #[sqlx(rename = "orderId")]
    pub order_id: Option<String>,
    pub status: String,
    pub payer: String,
    pub amount: String,
    pub currency: String, // asset as currency
    #[sqlx(rename = "txHash")]
    pub tx_hash: Option<String>,
    #[sqlx(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
    #[sqlx(rename = "settledAt")]
    pub settled_at: Option<DateTime<Utc>>,
    #[sqlx(rename = "productId")]
    pub product_id: Option<String>,
    #[sqlx(rename = "productName")]
    pub product_name: Option<String>,
}

/// データベースから取得するUser型
#[derive(Debug, FromRow)]
pub struct DbUser {
    #[sqlx(rename = "userId")]
    pub user_id: String,
    #[sqlx(rename = "walletId")]
    pub wallet_id: String,
}

/// データベースから取得するBalance型
#[derive(Debug, FromRow)]
pub struct DbBalance {
    pub currency: String,
    #[sqlx(rename = "currencyName")]
    pub currency_name: String,
    pub balance: String,
    pub decimals: i32,
}

/// データベースから取得するPurchase型（購入履歴用）
#[derive(Debug, FromRow)]
pub struct DbPurchase {
    #[sqlx(rename = "orderId")]
    pub order_id: String,
    pub sku: String,
    #[sqlx(rename = "productName")]
    pub product_name: String,
    pub quantity: i32,
    pub amount: String,
    pub currency: String,
    pub status: String,
    #[sqlx(rename = "purchasedAt")]
    pub purchased_at: DateTime<Utc>,
}

