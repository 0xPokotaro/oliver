/// X402ミドルウェアの設定
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct X402Config {
    pub pay_to: String,              // 受取人アドレス
    pub asset: String,               // トークンコントラクトアドレス
    pub max_amount_required: String,  // 最大必要額（wei）
    pub network: String,              // ネットワーク名
    pub max_timeout_seconds: u64,     // タイムアウト（秒）
    pub facilitator_url: String,     // Facilitator URL
    pub description: String,          // リソースの説明
}

/// 在庫ステータス
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StockStatus {
    InStock,
    LowStock,
    OutOfStock,
}

/// 文字列からStockStatusに変換
pub fn parse_stock_status(s: &str) -> StockStatus {
    match s {
        "in_stock" => StockStatus::InStock,
        "low_stock" => StockStatus::LowStock,
        "out_of_stock" => StockStatus::OutOfStock,
        _ => StockStatus::OutOfStock, // デフォルト値
    }
}

/// 商品情報（APIレスポンス用）
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Product {
    pub sku: String,
    pub name: String,
    pub price: String,  // wei単位の文字列
    pub currency: String,  // トークンコントラクトアドレス
    #[serde(rename = "stockStatus")]
    pub stock_status: StockStatus,
    #[serde(rename = "imageUrl")]
    pub image_url: String,
}

/// データベースから取得するProduct型
#[derive(Debug, sqlx::FromRow)]
pub struct DbProduct {
    pub id: String,
    pub sku: String,
    pub name: String,
    pub description: String,
    pub price: i64,  // BigIntはi64として扱う
    pub currency: String,
    #[sqlx(rename = "stock_status")]
    pub stock_status: String,
    #[sqlx(rename = "image_url")]
    pub image_url: Option<String>,
    pub category: Option<String>,
}

