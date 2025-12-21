mod config;
mod handlers;
mod types;

use anyhow::Context;
use axum::{routing::get, Router};
use config::{get_db_pool, get_port, get_x402_config};
use sqlx::PgPool;
use std::sync::Arc;

/// アプリケーションのルーターを構築
fn create_app(
    x402_config: Arc<types::X402Config>,
    db_pool: PgPool,
) -> Router {
    Router::new()
        .route("/api/v1/health", get(handlers::health::get_health))
        .route("/api/v1/products", get(handlers::products::get_products))
        .route("/api/x402/resource", get(handlers::resource::get_resource))
        .with_state((x402_config, db_pool))
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv::dotenv().ok();

    let x402_config = Arc::new(get_x402_config()?);
    let db_pool = get_db_pool().await.context("Failed to create database pool")?;
    let port = get_port();

    let app = create_app(x402_config, db_pool);
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port))
        .await
        .context("Failed to bind to address")?;

    println!("Server listening on http://0.0.0.0:{}", port);
    axum::serve(listener, app)
        .await
        .context("Failed to start server")?;

    Ok(())
}
