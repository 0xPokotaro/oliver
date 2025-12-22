use axum::Json;
use serde::{Deserialize, Serialize};
use crate::error::ApiError;

/// APIバージョン
pub const API_VERSION: &str = "1.0.0";

/// ヘルスチェックレスポンス
#[derive(Debug, Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
    #[serde(rename = "chainConnection")]
    pub chain_connection: bool,
    pub timestamp: i64,
}

/// GET /api/v1/health ハンドラー
pub async fn get_health() -> Result<Json<HealthResponse>, ApiError> {
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| ApiError::InternalError(format!("System time error: {}", e)))?
        .as_secs() as i64;

    Ok(Json(HealthResponse {
        status: "ok".to_string(),
        version: API_VERSION.to_string(),
        chain_connection: true,
        timestamp,
    }))
}

