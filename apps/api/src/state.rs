use crate::config::X402Config;
use sqlx::PgPool;
use std::sync::Arc;

/// アプリケーションの状態
#[derive(Clone)]
pub struct AppState {
    pub x402_config: Arc<X402Config>,
    pub db_pool: PgPool,
}

