/// データアクセス層（Repository パターン）

pub mod payment;
pub mod product;
pub mod user;

#[cfg(feature = "mock-data")]
mod user_mock;

// 関数を直接エクスポート（後方互換性のため）
#[allow(unused_imports)]
pub use payment::{create_payment, find_by_order_id, find_by_payment_id};
#[allow(unused_imports)]
pub use product::{find_all, find_by_category};

// トレイトとデフォルト実装をエクスポート（mockallテストで使用）
#[allow(unused_imports)]
pub use payment::{DefaultPaymentRepository, PaymentRepository};
#[allow(unused_imports)]
pub use product::{DefaultProductRepository, ProductRepository};
#[allow(unused_imports)]
pub use user::{DefaultUserRepository, UserRepository};

