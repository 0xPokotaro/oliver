use axum::{extract::Path, extract::State, Json};
use crate::error::{ApiError, error_codes};
use crate::models::{mapper::db_payment_to_order, Order};
use crate::repository::payment::find_by_order_id;
use crate::state::AppState;

/// GET /api/v1/orders/:orderId ハンドラー
pub async fn get_order_by_id(
    State(state): State<AppState>,
    Path(order_id): Path<String>,
) -> Result<Json<Order>, ApiError> {
    // データベースから注文情報を取得
    let db_payment = find_by_order_id(&state.db_pool, &order_id)
        .await?
        .ok_or_else(|| ApiError::NotFound {
            resource: "Order".to_string(),
            code: Some(error_codes::ORDER_NOT_FOUND.to_string()),
        })?;

    // DbPaymentHistoryからOrderへ変換
    let order = db_payment_to_order(db_payment)?;

    Ok(Json(order))
}


