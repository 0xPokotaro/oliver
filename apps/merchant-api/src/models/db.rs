/// データベース型

use sqlx::FromRow;
use chrono::{DateTime, Utc};

/// データベースから取得するProduct型
#[derive(Debug, FromRow)]
#[allow(dead_code)] // id, description, category は将来使用する可能性があるため
pub struct DbProduct {
    pub id: String,
    pub sku: String,
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
    #[sqlx(rename = "productSku")]
    pub product_sku: Option<String>,
    #[sqlx(rename = "productName")]
    pub product_name: Option<String>,
}

