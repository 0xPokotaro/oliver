use crate::types::X402Config;
use axum::{
    extract::State,
    http::HeaderMap,
    response::Response,
};
use std::sync::Arc;

/// GET /api/x402/resource ハンドラー
pub async fn get_resource(
    headers: HeaderMap,
    State(_config): State<Arc<X402Config>>,
) -> Response {
    // TODO: X-PAYMENTヘッダーを取得
    // TODO: x402ミドルウェアで決済を検証
    // TODO: 決済成功時はリソースを返す（X-PAYMENT-RESPONSEヘッダー付き）
    // TODO: 決済失敗時は402レスポンスを返す
    todo!()
}

