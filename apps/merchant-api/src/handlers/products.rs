use axum::{extract::{Query, State}, Json};
use crate::error::ApiError;
use crate::models::{GetProductsQuery, Product, mapper::db_product_to_api_product};
use crate::repository::ProductRepository;
use crate::state::AppState;

/// GET /api/v1/products ハンドラー
pub async fn get_products(
    State(state): State<AppState>,
    Query(query): Query<GetProductsQuery>,
) -> Result<Json<Vec<Product>>, ApiError> {
    // データベースから商品を取得
    let db_products = if let Some(ref category) = query.category {
        ProductRepository::find_by_category(&state.db_pool, category).await?
    } else {
        ProductRepository::find_all(&state.db_pool).await?
    };

    // DbProductからProductへ変換
    let products: Vec<_> = db_products
        .into_iter()
        .map(db_product_to_api_product)
        .collect();

    Ok(Json(products))
}
