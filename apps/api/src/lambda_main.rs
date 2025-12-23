/// Lambda関数用のエントリーポイント

#[allow(unused_imports)] // get_portはmain.rsで使用されているが、lambda_main.rsでは未使用
mod config;
mod error;
mod handlers;
mod models;
mod repository;
mod routes;
mod services;
mod state;
mod utils;

use lambda_http::{run, service_fn, Error, Request, Response};
use std::sync::Arc;
use config::{get_db_pool, get_x402_config};
use routes::create_router;
use state::AppState;
use tower::ServiceExt;

async fn handler_func(
    request: Request,
    app: Arc<axum::Router>,
) -> Result<Response<axum::body::Body>, Error> {
    // lambda_http::Requestをaxum::http::Requestに変換
    let (parts, body) = request.into_parts();
    
    // lambda_http::Bodyをbytesに変換
    let body_bytes = match body {
        lambda_http::Body::Empty => bytes::Bytes::new(),
        lambda_http::Body::Text(text) => text.into(),
        lambda_http::Body::Binary(binary) => binary.into(),
    };
    
    let mut axum_request = axum::http::Request::builder()
        .method(parts.method)
        .uri(parts.uri)
        .version(parts.version);
    
    for (key, value) in parts.headers.iter() {
        axum_request = axum_request.header(key, value);
    }
    
    let axum_request = axum_request
        .body(axum::body::Body::from(body_bytes))
        .map_err(|e| Error::from(format!("Request build error: {}", e)))?;

    // AxumのRouterを呼び出す
    let response = app
        .as_ref()
        .clone()
        .oneshot(axum_request)
        .await
        .map_err(|e| Error::from(format!("Request handling error: {}", e)))?;
    
    Ok(response)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_target(false)
        .without_time()
        .init();

    // 環境変数から設定を読み込む
    let x402_config = Arc::new(get_x402_config().map_err(|e| Error::from(format!("Config error: {}", e)))?);
    let db_pool = get_db_pool().await.map_err(|e| Error::from(format!("Database error: {}", e)))?;

    let state = AppState {
        x402_config,
        db_pool,
    };

    let app = Arc::new(create_router(state));

    run(service_fn(|request: Request| {
        let app = app.clone();
        async move {
            handler_func(request, app).await
        }
    })).await?;

    Ok(())
}

