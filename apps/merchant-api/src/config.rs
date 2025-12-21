use crate::types::X402Config;
use anyhow::Result;
use sqlx::PgPool;
use std::env;

/// デフォルトのサーバーポート
const DEFAULT_PORT: u16 = 3001;

/// 環境変数からX402設定を取得
pub fn get_x402_config() -> Result<X402Config> {
    Ok(X402Config {
        pay_to: env::var("X402_PAY_TO")
            .unwrap_or_else(|_| "0x0000000000000000000000000000000000000000".to_string()),
        asset: env::var("X402_ASSET")
            .unwrap_or_else(|_| "0x0000000000000000000000000000000000000000".to_string()),
        max_amount_required: env::var("X402_MAX_AMOUNT_REQUIRED")
            .unwrap_or_else(|_| "0".to_string()),
        network: env::var("X402_NETWORK").unwrap_or_else(|_| "localhost".to_string()),
        max_timeout_seconds: env::var("X402_MAX_TIMEOUT_SECONDS")
            .unwrap_or_else(|_| "3600".to_string())
            .parse()
            .map_err(|e| anyhow::anyhow!("Failed to parse X402_MAX_TIMEOUT_SECONDS: {}", e))?,
        facilitator_url: env::var("FACILITATOR_URL")
            .unwrap_or_else(|_| "http://localhost:8403".to_string()),
        description: env::var("X402_DESCRIPTION")
            .unwrap_or_else(|_| "Access to protected resource".to_string()),
    })
}

/// サーバーポートを取得
pub fn get_port() -> u16 {
    env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(DEFAULT_PORT)
}

/// データベース接続プールを取得
pub async fn get_db_pool() -> Result<PgPool> {
    let database_url = env::var("DATABASE_URL")
        .map_err(|_| anyhow::anyhow!("DATABASE_URL environment variable is not set"))?;
    
    PgPool::connect(&database_url)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to connect to database: {}", e))
}

