/// Lambda Runtime用のエントリーポイント
/// 
/// 注意: このファイルは`lambda_main.rs`で直接実装されているため、
/// 現在は使用されていません。将来の拡張用に残しています。

use std::sync::Arc;

use crate::config::{get_db_pool, get_x402_config};
use crate::routes::create_router;
use crate::state::AppState;

/// Lambda関数のハンドラー（未使用）
/// 
/// 実際のLambdaエントリーポイントは`lambda_main.rs`を参照してください。
#[allow(dead_code)]
pub async fn handler() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // 環境変数から設定を読み込む
    let x402_config = Arc::new(get_x402_config()?);
    let db_pool = get_db_pool().await?;

    let state = AppState {
        x402_config,
        db_pool,
    };

    let app = create_router(state);

    // ローカル開発用（通常のサーバーとして起動）
    let port = crate::config::get_port();
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port)).await?;
    println!("Server listening on http://0.0.0.0:{}", port);
    axum::serve(listener, app).await?;

    Ok(())
}

