/// JWT認証関連のユーティリティ関数

use axum::http::HeaderMap;
use crate::error::ApiError;

/// AuthorizationヘッダーからJWTトークンを抽出し、ユーザーIDを取得
/// 
/// 現在は簡易実装として、JWTトークンをデコードせずに、トークン自体をユーザーIDとして扱う
/// 本番環境では、適切なJWT検証ライブラリを使用する必要があります
pub fn extract_user_id_from_jwt(headers: &HeaderMap) -> Result<String, ApiError> {
    // Authorizationヘッダーを取得
    let auth_header = headers
        .get("Authorization")
        .ok_or_else(|| ApiError::Unauthorized {
            code: Some("UNAUTHORIZED".to_string()),
        })?;

    // ヘッダー値を文字列に変換
    let auth_str = auth_header
        .to_str()
        .map_err(|_| ApiError::Unauthorized {
            code: Some("UNAUTHORIZED".to_string()),
        })?;

    // "Bearer " プレフィックスを確認
    if !auth_str.starts_with("Bearer ") {
        return Err(ApiError::Unauthorized {
            code: Some("UNAUTHORIZED".to_string()),
        });
    }

    // トークンを抽出
    let token = auth_str.strip_prefix("Bearer ").unwrap().trim();

    if token.is_empty() {
        return Err(ApiError::Unauthorized {
            code: Some("UNAUTHORIZED".to_string()),
        });
    }

    // TODO: 実際のJWT検証を実装
    // 現在は簡易実装として、トークンをユーザーIDとして扱う
    // 本番環境では、JWTをデコードしてsubクレームからユーザーIDを取得する必要があります
    // 例: user_12345 というトークンが来たら、user_12345をユーザーIDとして扱う
    Ok(token.to_string())
}

