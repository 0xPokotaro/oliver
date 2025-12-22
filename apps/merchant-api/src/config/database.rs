/// データベース設定

use anyhow::Result;
use sqlx::PgPool;
use std::env;

/// データベース接続プールを取得
pub async fn get_db_pool() -> Result<PgPool> {
    let database_url = env::var("DATABASE_URL")
        .map_err(|_| anyhow::anyhow!("DATABASE_URL environment variable is not set"))?;
    
    PgPool::connect(&database_url)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to connect to database: {}", e))
}

