/// サーバー設定

use std::env;

/// デフォルトのサーバーポート
const DEFAULT_PORT: u16 = 3001;

/// サーバーポートを取得
pub fn get_port() -> u16 {
    env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(DEFAULT_PORT)
}

