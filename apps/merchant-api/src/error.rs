use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

/// APIエラー型
#[derive(Debug)]
pub enum ApiError {
    /// データベースエラー
    DatabaseError(String),
    /// リソースが見つからない
    NotFound { resource: String },
    /// 内部サーバーエラー
    InternalError(String),
    /// バリデーションエラー
    ValidationError { message: String },
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, error_code, message) = match &self {
            ApiError::DatabaseError(msg) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "DATABASE_ERROR",
                format!("Database error: {}", msg),
            ),
            ApiError::NotFound { resource } => (
                StatusCode::NOT_FOUND,
                "NOT_FOUND",
                format!("{} not found", resource),
            ),
            ApiError::InternalError(msg) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "INTERNAL_ERROR",
                msg.clone(),
            ),
            ApiError::ValidationError { message } => (
                StatusCode::BAD_REQUEST,
                "VALIDATION_ERROR",
                message.clone(),
            ),
        };

        let body = Json(json!({
            "error": message,
            "code": error_code,
        }));

        (status, body).into_response()
    }
}

impl From<sqlx::Error> for ApiError {
    fn from(err: sqlx::Error) -> Self {
        ApiError::DatabaseError(err.to_string())
    }
}

