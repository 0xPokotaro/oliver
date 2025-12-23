/// 注文関連のユーティリティ関数

use chrono::Utc;

/// 注文IDを生成
/// 形式: `ord_YYYYMMDD_<random>`
pub fn generate_order_id() -> String {
    let date = Utc::now().format("%Y%m%d");
    // ランダムな6文字の文字列を生成（簡単な実装）
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    Utc::now().timestamp_nanos_opt().unwrap_or(0).hash(&mut hasher);
    let random = format!("{:x}", hasher.finish()).chars().take(6).collect::<String>();
    format!("ord_{}_{}", date, random)
}

