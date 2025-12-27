/// 認証ハンドラー

use axum::{
    extract::State,
    response::IntoResponse,
    Json,
};
use axum_extra::extract::CookieJar;
use crate::error::ApiError;
use crate::models::{LoginRequest, LoginResponse};
use crate::state::AppState;
use crate::utils::dynamic_jwt::verify_dynamic_jwt;
use crate::utils::session::generate_session_token;
use crate::repository::user::upsert_user;
use crate::config::{get_dynamic_env_id, get_session_secret};

/// POST /api/auth/login ハンドラー
pub async fn login(
    State(state): State<AppState>,
    jar: CookieJar,
    Json(request): Json<LoginRequest>,
) -> Result<impl IntoResponse, ApiError> {
    // 1. リクエストバリデーション
    if request.auth_token.is_empty() {
        return Err(ApiError::ValidationError {
            message: "authToken is required".to_string(),
        });
    }

    // 2. 環境変数を取得
    let dynamic_env_id = get_dynamic_env_id()?;
    let session_secret = get_session_secret()?;

    // 3. JWT検証とユーザー情報抽出
    let verification_result = verify_dynamic_jwt(&request.auth_token, &dynamic_env_id).await?;

    // 4. データベースにUpsert
    let user = upsert_user(
        &state.db_pool,
        &verification_result.dynamic_user_id,
        &verification_result.wallet_address,
    )
    .await?;

    // 5. セッションJWTを生成
    let session_token = generate_session_token(&user.id, &session_secret)?;

    // 6. Cookieを設定
    let mut cookie = axum_extra::extract::cookie::Cookie::new("session", session_token);
    cookie.set_http_only(true);
    cookie.set_secure(true);
    cookie.set_same_site(axum_extra::extract::cookie::SameSite::Strict);
    cookie.set_path("/");
    cookie.set_max_age(time::Duration::days(7));
    
    let cookie_jar = jar.add(cookie);

    // 7. レスポンスを作成
    let response = LoginResponse {
        user_id: user.id,
        wallet_address: user.wallet_address,
    };

    // 8. Cookie付きレスポンスを返却
    Ok((cookie_jar, Json(response)).into_response())
}

/// POST /api/auth/logout ハンドラー
pub async fn logout(jar: CookieJar) -> Result<impl IntoResponse, ApiError> {
    // セッションCookieを削除
    // 削除時は同じ属性（path, same_site等）を設定する必要がある
    // max_ageを0に設定することでCookieを削除する
    let mut cookie = axum_extra::extract::cookie::Cookie::new("session", "");
    cookie.set_http_only(true);
    cookie.set_secure(true);
    cookie.set_same_site(axum_extra::extract::cookie::SameSite::Strict);
    cookie.set_path("/");
    cookie.set_max_age(time::Duration::seconds(0)); // 即座に期限切れにする
    
    let cookie_jar = jar.add(cookie);
    
    // 成功レスポンスを返却
    Ok((cookie_jar, Json(serde_json::json!({ "message": "Logged out successfully" }))).into_response())
}

