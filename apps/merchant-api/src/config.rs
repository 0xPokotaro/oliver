use crate::types::X402Config;
use anyhow::Result;

/// 環境変数からX402設定を取得
pub fn get_x402_config() -> Result<X402Config> {
    // TODO: 環境変数から設定を読み込む
    todo!()
}

/// サーバーポートを取得
pub fn get_port() -> u16 {
    // TODO: 環境変数からポートを取得（デフォルト: 3001）
    todo!()
}

