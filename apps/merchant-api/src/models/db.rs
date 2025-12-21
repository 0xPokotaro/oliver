/// データベース型

use sqlx::FromRow;

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

