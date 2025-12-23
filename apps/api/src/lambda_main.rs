/// Lambda関数用のエントリーポイント

mod config;
mod error;
mod handlers;
mod models;
mod repository;
mod routes;
mod services;
mod state;
mod utils;

use lambda_web::{is_running_on_lambda, run_hyper_on_lambda};
use std::sync::Arc;
use config::{get_db_pool, get_x402_config};
use routes::create_router;
use state::AppState;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // 環境変数から設定を読み込む
    let x402_config = Arc::new(get_x402_config()?);
    let db_pool = get_db_pool().await?;

    let state = AppState {
        x402_config,
        db_pool,
    };

    let app = create_router(state);

    // Lambda環境で実行
    if is_running_on_lambda() {
        run_hyper_on_lambda(app).await?;
    } else {
        // ローカル開発用（通常のサーバーとして起動）
        let port = config::get_port();
        let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port)).await?;
        println!("Server listening on http://0.0.0.0:{}", port);
        axum::serve(listener, app).await?;
    }

    Ok(())
}

