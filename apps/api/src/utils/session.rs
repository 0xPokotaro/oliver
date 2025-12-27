/// セッション管理ユーティリティ

use jsonwebtoken::{encode, decode, DecodingKey, EncodingKey, Header, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use chrono::{Duration, Utc};
use crate::error::{ApiError, error_codes};

/// セッションJWTペイロード
#[derive(Debug, Serialize, Deserialize)]
struct SessionClaims {
    sub: String, // user_id
    exp: i64,    // 有効期限
    iat: i64,    // 発行時刻
}

/// セッションの有効期限（7日間）
const SESSION_DURATION_DAYS: i64 = 7;

/// セッションJWTを生成
pub fn generate_session_token(user_id: &str, secret: &str) -> Result<String, ApiError> {
    let now = Utc::now();
    let exp = now + Duration::days(SESSION_DURATION_DAYS);

    let claims = SessionClaims {
        sub: user_id.to_string(),
        exp: exp.timestamp(),
        iat: now.timestamp(),
    };

    let header = Header::default();
    let encoding_key = EncodingKey::from_secret(secret.as_bytes());

    encode(&header, &claims, &encoding_key)
        .map_err(|e| {
            tracing::error!("Failed to encode session token: {}", e);
            ApiError::InternalError(format!("Failed to generate session token: {}", e))
        })
}

/// セッションJWTを検証してユーザーIDを取得
#[allow(dead_code)]
pub fn verify_session_token(token: &str, secret: &str) -> Result<String, ApiError> {
    let validation = Validation::new(Algorithm::HS256);
    let decoding_key = DecodingKey::from_secret(secret.as_bytes());

    let token_data = decode::<SessionClaims>(token, &decoding_key, &validation)
        .map_err(|e| {
            tracing::error!("Failed to verify session token: {}", e);
            ApiError::Unauthorized {
                code: Some(error_codes::INVALID_SESSION.to_string()),
            }
        })?;

    Ok(token_data.claims.sub)
}

