use axum::{
    extract::{Multipart, Path, Query, State},
    http::HeaderMap,
    Json,
};
use crate::error::{ApiError, error_codes};
use crate::models::{
    GetUserQuery, UserInformation, VoiceCommandResponse,
    mapper::{db_balance_to_api_balance, db_purchase_to_api_purchase},
};
use crate::repository::user::{find_by_id, find_balances_by_user_id, find_purchases_by_user_id};
use crate::state::AppState;
use crate::utils::auth::extract_user_id_from_jwt;
use crate::utils::validation::validate_user_query;
use sqlx::PgPool;

/// 共通のユーザー情報取得ロジック
async fn fetch_user_information(
    db_pool: &PgPool,
    user_id: &str,
    query: &GetUserQuery,
) -> Result<UserInformation, ApiError> {
    // バリデーション
    validate_user_query(query)?;

    // ユーザー情報を取得
    let db_user = find_by_id(db_pool, user_id)
        .await?
        .ok_or_else(|| ApiError::NotFound {
            resource: "User".to_string(),
            code: Some(error_codes::USER_NOT_FOUND.to_string()),
        })?;

    // 残高を取得
    let db_balances = find_balances_by_user_id(db_pool, user_id).await?;
    let balances = db_balances
        .into_iter()
        .map(db_balance_to_api_balance)
        .collect();

    // 購入履歴を取得（includeHistoryがtrueの場合のみ）
    let purchase_history = if query.include_history {
        let db_purchases = find_purchases_by_user_id(
            db_pool,
            user_id,
            query.history_limit,
        )
        .await?;

        db_purchases
            .into_iter()
            .map(db_purchase_to_api_purchase)
            .collect()
    } else {
        vec![]
    };

    // レスポンスを構築
    Ok(UserInformation {
        user_id: db_user.user_id,
        wallet_id: db_user.wallet_id,
        balances,
        purchase_history,
    })
}

/// GET /api/v1/user/profile ハンドラー
pub async fn get_user_profile(
    State(state): State<AppState>,
    headers: HeaderMap,
    Query(query): Query<GetUserQuery>,
) -> Result<Json<UserInformation>, ApiError> {
    // JWTからユーザーIDを取得
    let user_id = extract_user_id_from_jwt(&headers)?;

    // 共通ロジックを呼び出し
    let user_info = fetch_user_information(&state.db_pool, &user_id, &query).await?;
    Ok(Json(user_info))
}

/// GET /api/v1/users/:userId ハンドラー
pub async fn get_user_by_id(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
    Query(query): Query<GetUserQuery>,
) -> Result<Json<UserInformation>, ApiError> {
    // 共通ロジックを呼び出し
    let user_info = fetch_user_information(&state.db_pool, &user_id, &query).await?;
    Ok(Json(user_info))
}

/// POST /api/v1/users/:userId/voice ハンドラー
/// 音声コマンドを受け取り、処理を実行する（スケルトン実装）
pub async fn execute_voice_command(
    State(_state): State<AppState>,
    Path(user_id): Path<String>,
    mut multipart: Multipart,
) -> Result<Json<VoiceCommandResponse>, ApiError> {
    tracing::info!("Received voice command for user: {}", user_id);

    // multipart/form-dataから音声ファイルを抽出
    let mut audio_field_found = false;

    while let Some(field) = multipart.next_field().await.map_err(|e| {
        tracing::error!("Failed to read multipart field: {}", e);
        ApiError::ValidationError {
            message: format!("Failed to read multipart data: {}", e),
        }
    })? {
        let name = field.name().unwrap_or("").to_string();
        
        if name == "audio" {
            audio_field_found = true;
            
            // ファイル名を確認（WAVファイルかチェック）
            let file_name = field.file_name().unwrap_or("").to_string();
            if !file_name.is_empty() && !file_name.ends_with(".wav") {
                tracing::warn!("Non-WAV file uploaded: {}", file_name);
                return Err(ApiError::ValidationError {
                    message: "Invalid audio format: only WAV is supported".to_string(),
                });
            }

            // 音声データを読み取る（スケルトン実装のため、サイズのみ記録）
            let data = field.bytes().await.map_err(|e| {
                tracing::error!("Failed to read audio data: {}", e);
                ApiError::ValidationError {
                    message: format!("Failed to read audio data: {}", e),
                }
            })?;
            
            tracing::info!("Received audio file: {} bytes", data.len());
            
            // TODO: ここで音声処理とコマンド実行を行う
            // - 音声認識（STT: Speech-to-Text）
            // - コマンドの解析と実行
            // - 実行結果の返却
        }
    }

    // 音声フィールドが見つからない場合はエラー
    if !audio_field_found {
        tracing::warn!("Audio field not found in multipart data");
        return Err(ApiError::ValidationError {
            message: "Missing required field: audio".to_string(),
        });
    }

    // スケルトン実装: 固定のレスポンスを返却
    tracing::info!("Voice command processed successfully (skeleton implementation)");
    Ok(Json(VoiceCommandResponse {
        success: true,
    }))
}
