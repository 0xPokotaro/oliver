/// APIレスポンス型とリクエスト型

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

/// 在庫ステータス
#[typeshare]
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StockStatus {
    #[serde(rename = "in_stock")]
    InStock,
    #[serde(rename = "low_stock")]
    LowStock,
    #[serde(rename = "out_of_stock")]
    OutOfStock,
}

/// 商品情報（APIレスポンス用）
#[typeshare]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Product {
    pub sku: String,
    pub name: String,
    pub price: String, // wei単位の文字列
    pub currency: String, // トークンコントラクトアドレス
    #[serde(rename = "stockStatus")]
    pub stock_status: StockStatus,
    #[serde(rename = "imageUrl")]
    pub image_url: String,
}

/// 商品一覧取得のクエリパラメータ
#[derive(Debug, Deserialize)]
pub struct GetProductsQuery {
    pub category: Option<String>,
}

pub mod db;
pub mod mapper;

