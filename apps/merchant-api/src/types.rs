/// X402ミドルウェアの設定
#[derive(Debug, Clone)]
pub struct X402Config {
    pub pay_to: String,              // 受取人アドレス
    pub asset: String,               // トークンコントラクトアドレス
    pub max_amount_required: String,  // 最大必要額（wei）
    pub network: String,              // ネットワーク名
    pub max_timeout_seconds: u64,     // タイムアウト（秒）
    pub facilitator_url: String,     // Facilitator URL
    pub description: String,          // リソースの説明
}

