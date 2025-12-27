/// バリデーションユーティリティ

use crate::error::ApiError;
use crate::models::GetUserQuery;

/// GetUserQueryのバリデーション
pub fn validate_user_query(query: &GetUserQuery) -> Result<(), ApiError> {
    if query.history_limit < 1 || query.history_limit > 100 {
        return Err(ApiError::ValidationError {
            message: "historyLimit must be between 1 and 100".to_string(),
        });
    }
    Ok(())
}
