mod config;
mod chain;
mod verifier;

use axum::Router;
use config::get_port;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv::dotenv().ok();

    let port = get_port();

    let app = Router::new();

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port)).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

