use axum::{
    extract::State,
    http::HeaderMap,
    response::Response,
};
use crate::state::AppState;

/// GET /api/x402/resource ハンドラー
pub async fn get_resource(
    _headers: HeaderMap,
    State(_state): State<AppState>,
) -> Response {
    // TODO: X-PAYMENTヘッダーを取得
    // TODO: x402ミドルウェアで決済を検証
    // TODO: 決済成功時はリソースを返す（X-PAYMENT-RESPONSEヘッダー付き）
    // TODO: 決済失敗時は402レスポンスを返す
    todo!()
}

