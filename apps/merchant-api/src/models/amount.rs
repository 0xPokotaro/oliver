/// 金額型と変換ユーティリティ

/// 価格を表す型（wei単位）
pub type Price = i64;

/// 価格を文字列に変換（wei単位の文字列）
pub fn price_to_string(price: Price) -> String {
    price.to_string()
}

