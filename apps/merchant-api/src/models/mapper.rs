/// データベース型からAPI型への変換

use crate::models::db::DbProduct;
use crate::models::{Product, StockStatus};
use crate::utils::parse_stock_status;

/// DbProductからProductへ変換
pub fn db_product_to_api_product(db_product: DbProduct) -> Product {
    Product {
        sku: db_product.sku,
        name: db_product.name,
        price: db_product.price.to_string(),
        currency: db_product.currency,
        stock_status: parse_stock_status(&db_product.stock_status),
        image_url: db_product.image_url.unwrap_or_default(),
    }
}
