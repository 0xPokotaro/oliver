use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Deserialize;
use sqlx::PgPool;
use std::sync::Arc;
use crate::types::{parse_stock_status, DbProduct, Product, X402Config};

/// 商品一覧取得のクエリパラメータ
#[derive(Debug, Deserialize)]
pub struct GetProductsQuery {
    pub category: Option<String>,
}

/// GET /api/v1/products ハンドラー
pub async fn get_products(
    State((_, db_pool)): State<(Arc<X402Config>, PgPool)>,
    Query(query): Query<GetProductsQuery>,
) -> Result<Json<Vec<Product>>, Response> {
    // データベースから商品を取得
    let db_products = if let Some(ref category) = query.category {
        sqlx::query_as::<_, DbProduct>(
            r#"
            SELECT id, sku, name, description, price, currency, stock_status, image_url, category
            FROM products
            WHERE category = $1
            ORDER BY created_at DESC
            "#,
        )
        .bind(category)
        .fetch_all(&db_pool)
        .await
    } else {
        sqlx::query_as::<_, DbProduct>(
            r#"
            SELECT id, sku, name, description, price, currency, stock_status, image_url, category
            FROM products
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(&db_pool)
        .await
    }
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({
                "error": "Failed to fetch products",
                "code": "INTERNAL_ERROR"
            })),
        )
            .into_response()
    })?;

    // DbProductからProductへ変換
    let products: Vec<Product> = db_products
        .into_iter()
        .map(|db_product| Product {
            sku: db_product.sku,
            name: db_product.name,
            price: db_product.price.to_string(),
            currency: db_product.currency,
            stock_status: parse_stock_status(&db_product.stock_status),
            image_url: db_product.image_url.unwrap_or_default(),
        })
        .collect();

    Ok(Json(products))
}
