/// 在庫ステータス関連のユーティリティ

use crate::models::StockStatus;

/// 文字列からStockStatusに変換
pub fn parse_stock_status(s: &str) -> StockStatus {
    match s {
        "in_stock" => StockStatus::InStock,
        "low_stock" => StockStatus::LowStock,
        "out_of_stock" => StockStatus::OutOfStock,
        _ => StockStatus::OutOfStock, // デフォルト値
    }
}

