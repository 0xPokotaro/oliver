use axum::{
    http::{HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use crate::models::PaymentRequiredResponse;

/// APIエラー型
#[derive(Debug)]
pub enum ApiError {
    /// データベースエラー
    DatabaseError(String),
    /// リソースが見つからない
    NotFound { resource: String, code: Option<String> },
    /// 内部サーバーエラー
    InternalError(String),
    /// バリデーションエラー
    ValidationError { message: String },
    /// 認証エラー（401 Unauthorized）
    Unauthorized { code: Option<String> },
    /// 402 Payment Required（特殊なレスポンス）
    PaymentRequired { response: PaymentRequiredResponse, authenticate_header: String },
    /// 決済関連エラー
    PaymentError { kind: PaymentErrorKind, code: String },
}

/// 決済エラーの種類
#[derive(Debug)]
pub enum PaymentErrorKind {
    /// 署名無効（403）
    SignatureInvalid,
    /// 残高不足（403）
    InsufficientFunds,
    /// Nonce重複（409）
    NonceUsed,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        match self {
            ApiError::PaymentRequired { response, authenticate_header } => {
                let mut headers = HeaderMap::new();
                if let Ok(header_value) = HeaderValue::from_str(&authenticate_header) {
                    headers.insert("WWW-Authenticate", header_value);
                }
                (StatusCode::PAYMENT_REQUIRED, headers, Json(response)).into_response()
            },
            ApiError::DatabaseError(msg) => {
                create_error_response(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "DATABASE_ERROR",
                    &format!("Database error: {}", msg),
                )
            },
            ApiError::NotFound { resource, code } => {
                let code = code.as_deref().unwrap_or("NOT_FOUND");
                create_error_response(
                    StatusCode::NOT_FOUND,
                    code,
                    &format!("{} not found", resource),
                )
            },
            ApiError::InternalError(msg) => {
                create_error_response(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR",
                    &msg,
                )
            },
            ApiError::ValidationError { message } => {
                // INVALID_PARAMETERとして扱う（ドキュメントに合わせる）
                let code = if message.contains("authToken") {
                    error_codes::INVALID_PARAMETER
                } else {
                    error_codes::VALIDATION_ERROR
                };
                create_error_response(
                    StatusCode::BAD_REQUEST,
                    code,
                    &message,
                )
            },
            ApiError::Unauthorized { code } => {
                let code = code.as_deref().unwrap_or(error_codes::UNAUTHORIZED);
                let message = match code {
                    error_codes::INVALID_TOKEN => "Invalid or expired JWT token",
                    error_codes::REQUIRES_ADDITIONAL_AUTH => "Additional verification required",
                    error_codes::INVALID_SESSION => "Invalid session token",
                    _ => "Unauthorized",
                };
                create_error_response(
                    StatusCode::UNAUTHORIZED,
                    code,
                    message,
                )
            },
            ApiError::PaymentError { kind, code } => {
                let (status, message) = match kind {
                    PaymentErrorKind::SignatureInvalid => (
                        StatusCode::FORBIDDEN,
                        "Invalid payment intent signature".to_string(),
                    ),
                    PaymentErrorKind::InsufficientFunds => (
                        StatusCode::FORBIDDEN,
                        "Insufficient funds".to_string(),
                    ),
                    PaymentErrorKind::NonceUsed => (
                        StatusCode::CONFLICT,
                        "Nonce already used".to_string(),
                    ),
                };
                create_error_response(status, &code, &message)
            },
        }
    }
}

/// エラーレスポンスを作成
fn create_error_response(status: StatusCode, code: &str, message: &str) -> Response {
    let body = Json(json!({
        "error": message,
        "code": code,
    }));
    (status, body).into_response()
}

impl From<sqlx::Error> for ApiError {
    fn from(err: sqlx::Error) -> Self {
        ApiError::DatabaseError(err.to_string())
    }
}

/// エラーコード定数
pub mod error_codes {
    // リソースが見つからない系
    pub const PRODUCT_NOT_FOUND: &str = "PRODUCT_NOT_FOUND";
    pub const USER_NOT_FOUND: &str = "USER_NOT_FOUND";
    pub const ORDER_NOT_FOUND: &str = "ORDER_NOT_FOUND";

    // 認証・認可系
    pub const UNAUTHORIZED: &str = "UNAUTHORIZED";
    pub const INVALID_TOKEN: &str = "INVALID_TOKEN";
    pub const INVALID_SESSION: &str = "INVALID_SESSION";
    pub const REQUIRES_ADDITIONAL_AUTH: &str = "REQUIRES_ADDITIONAL_AUTH";

    // 決済系
    pub const NONCE_USED: &str = "NONCE_USED";
    pub const INSUFFICIENT_FUNDS: &str = "INSUFFICIENT_FUNDS";
    pub const SIGNATURE_INVALID: &str = "SIGNATURE_INVALID";

    // バリデーション系
    pub const VALIDATION_ERROR: &str = "VALIDATION_ERROR";
    pub const INVALID_PARAMETER: &str = "INVALID_PARAMETER";
}

