/// データベース型からAPI型への変換

use crate::error::ApiError;
use crate::models::{
    amount::price_to_string,
    db::{DbBalance, DbPaymentHistory, DbProduct, DbPurchase},
    stock::parse_stock_status,
    Balance, Order, OrderStatus, Product, ProductDetail, Purchase,
};
use serde_json::json;

/// DbProductからProductへ変換
pub fn db_product_to_api_product(db_product: DbProduct) -> Product {
    Product {
        id: db_product.id,
        name: db_product.name,
        price: price_to_string(db_product.price),
        currency: db_product.currency,
        stock_status: parse_stock_status(&db_product.stock_status),
        image_url: db_product.image_url.unwrap_or_default(),
        category: db_product.category,
    }
}

/// DbProductからProductDetailへ変換
pub fn db_product_to_product_detail(db_product: DbProduct) -> ProductDetail {
    ProductDetail {
        id: db_product.id,
        name: db_product.name,
        description: db_product.description,
        price: price_to_string(db_product.price),
        currency: db_product.currency.clone(),
        attributes: db_product.attributes.unwrap_or_else(|| json!({})),
        allowed_tokens: vec![db_product.currency],
    }
}

/// PaymentHistoryのstatus文字列をOrderStatusに変換
/// payment_history.statusは "pending", "settled", "failed" だが、
/// Order.statusは "processing", "shipped", "delivered", "cancelled", "failed" にマッピング
fn parse_order_status(payment_status: &str) -> OrderStatus {
    match payment_status {
        "settled" => OrderStatus::Processing, // 決済完了 = 発送準備中
        "pending" => OrderStatus::Processing, // 決済待ちも発送準備中として扱う
        "failed" => OrderStatus::Failed,
        _ => OrderStatus::Processing, // デフォルトはprocessing
    }
}

/// DbPaymentHistoryからOrderに変換
pub fn db_payment_to_order(db_payment: DbPaymentHistory) -> Result<Order, ApiError> {
    let order_id = db_payment.order_id.ok_or_else(|| {
        ApiError::InternalError("Order ID is missing in payment history".to_string())
    })?;

    Ok(Order {
        order_id,
        id: db_payment.product_id,
        quantity: 1,
        amount: db_payment.amount,
        currency: db_payment.currency,
        status: parse_order_status(&db_payment.status),
        tracking_number: None, // 現時点では追跡番号は未実装
        created_at: db_payment.created_at.to_rfc3339(),
    })
}

/// DB文字列からOrderStatusへ変換（購入履歴用）
/// 購入履歴用: "processing", "shipped", "delivered", "cancelled", "failed"
pub fn parse_purchase_status(status: &str) -> OrderStatus {
    match status {
        "processing" => OrderStatus::Processing,
        "shipped" => OrderStatus::Shipped,
        "delivered" => OrderStatus::Delivered,
        "cancelled" => OrderStatus::Cancelled,
        "failed" => OrderStatus::Failed,
        _ => OrderStatus::Processing, // デフォルト値
    }
}

/// DbBalanceからBalanceへ変換
pub fn db_balance_to_api_balance(db_balance: DbBalance) -> Balance {
    Balance {
        currency: db_balance.currency,
        currency_name: db_balance.currency_name,
        balance: db_balance.balance,
        decimals: db_balance.decimals,
    }
}

/// DbPurchaseからPurchaseへ変換
pub fn db_purchase_to_api_purchase(db_purchase: DbPurchase) -> Purchase {
    Purchase {
        order_id: db_purchase.order_id,
        sku: db_purchase.sku,
        product_name: db_purchase.product_name,
        quantity: db_purchase.quantity,
        amount: db_purchase.amount,
        currency: db_purchase.currency,
        status: parse_purchase_status(&db_purchase.status),
        purchased_at: db_purchase.purchased_at.to_rfc3339(),
    }
}
