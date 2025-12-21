mod config;
mod handlers;
mod types;

use axum::{routing::get, Router};
use config::{get_port, get_x402_config};
use std::sync::Arc;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv::dotenv().ok();

    let x402_config = Arc::new(get_x402_config()?);
    let port = get_port();

    let app = Router::new()
        .route("/api/x402/resource", get(handlers::resource::get_resource))
        .with_state(x402_config);

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port)).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
