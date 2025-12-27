/// 認証設定

use std::env;
use crate::error::ApiError;

/// Dynamic環境IDを取得
pub fn get_dynamic_env_id() -> Result<String, ApiError> {
    env::var("DYNAMIC_ENV_ID")
        .map_err(|_| ApiError::InternalError(
            "DYNAMIC_ENV_ID environment variable is not set".to_string()
        ))
}

/// セッション秘密鍵を取得
pub fn get_session_secret() -> Result<String, ApiError> {
    env::var("SESSION_SECRET")
        .map_err(|_| ApiError::InternalError(
            "SESSION_SECRET environment variable is not set".to_string()
        ))
}

