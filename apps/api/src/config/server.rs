/// サーバー設定

use std::env;

/// デフォルトのサーバーポート
#[allow(dead_code)] // main.rsで使用されているが、lambda_main.rsでは未使用
const DEFAULT_PORT: u16 = 3001;

/// サーバーポートを取得
#[allow(dead_code)] // main.rsで使用されているが、lambda_main.rsでは未使用
pub fn get_port() -> u16 {
    env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(DEFAULT_PORT)
}

