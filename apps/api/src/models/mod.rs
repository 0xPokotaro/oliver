/// APIレスポンス型とリクエスト型

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

pub mod amount;
pub mod stock;

/// 在庫ステータス
#[typeshare]
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StockStatus {
    #[serde(rename = "in_stock")]
    InStock,
    #[serde(rename = "low_stock")]
    LowStock,
    #[serde(rename = "out_of_stock")]
    OutOfStock,
}

/// 商品情報（APIレスポンス用）
#[typeshare]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Product {
    pub id: String,
    pub name: String,
    pub price: String, // wei単位の文字列
    pub currency: String, // トークンコントラクトアドレス
    #[serde(rename = "stockStatus")]
    pub stock_status: StockStatus,
    #[serde(rename = "imageUrl")]
    pub image_url: String,
    pub category: Option<String>, // カテゴリ（例: "cat_food", "dog_food"など）
}

/// 商品一覧取得のクエリパラメータ
#[derive(Debug, Deserialize)]
pub struct GetProductsQuery {
    pub category: Option<String>,
}

/// 商品詳細情報（APIレスポンス用）
#[typeshare]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductDetail {
    pub id: String,
    pub name: String,
    pub description: String,
    pub price: String, // wei単位の文字列
    pub currency: String, // トークンコントラクトアドレス
    pub attributes: serde_json::Value, // JSONオブジェクト
    #[serde(rename = "allowedTokens")]
    pub allowed_tokens: Vec<String>, // 支払い可能なトークン一覧
}

/// 注文ステータス
#[typeshare]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OrderStatus {
    #[serde(rename = "processing")]
    Processing, // 決済OK、発送準備中
    #[serde(rename = "shipped")]
    Shipped, // 発送済み
    #[serde(rename = "delivered")]
    Delivered, // 到着済み
    #[serde(rename = "cancelled")]
    Cancelled, // 在庫切れ等で返金
    #[serde(rename = "failed")]
    Failed, // 決済失敗
}

/// 注文情報（APIレスポンス用）
#[typeshare]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Order {
    #[serde(rename = "orderId")]
    pub order_id: String,
    pub id: Option<String>, // 商品ID
    pub quantity: i32, // 数量
    pub amount: String, // wei単位の文字列
    pub currency: String, // トークンコントラクトアドレス
    pub status: OrderStatus,
    #[serde(rename = "trackingNumber")]
    pub tracking_number: Option<String>, // 追跡番号（発送後に値が入る）
    #[serde(rename = "createdAt")]
    pub created_at: String, // ISO 8601形式
}

/// 購入リクエストボディ
#[derive(Debug, Deserialize)]
pub struct BuyRequest {
    pub quantity: i32,
}

/// 購入レスポンス（200 OK）
#[typeshare]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuyResponse {
    pub status: String,
    #[serde(rename = "orderId")]
    pub order_id: String,
    pub message: String,
    #[serde(rename = "estimatedArrival")]
    pub estimated_arrival: Option<String>,
    pub payment: PaymentInfo,
}

/// 決済情報
#[typeshare]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentInfo {
    #[serde(rename = "paymentId")]
    pub payment_id: String,
    pub payer: String,
    pub amount: String,
    #[serde(rename = "txHash")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tx_hash: Option<String>,
}

/// 402 Payment Requiredレスポンス
#[typeshare]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentRequiredResponse {
    #[serde(rename = "x402Version")]
    pub x402_version: i32,
    pub accepts: Vec<PaymentAccept>,
    pub error: String,
}

/// 決済受け入れ情報
#[typeshare]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentAccept {
    pub scheme: String,
    pub network: String,
    #[serde(rename = "maxAmountRequired")]
    pub max_amount_required: String,
    pub resource: String,
    pub description: String,
    #[serde(rename = "payTo")]
    pub pay_to: String,
    pub asset: String,
    #[serde(rename = "maxTimeoutSeconds")]
    pub max_timeout_seconds: i64,
    #[serde(rename = "chainId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub chain_id: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub currency: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nonce: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deadline: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<PaymentMetadata>,
}

/// 決済メタデータ
#[typeshare]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subtotal: Option<String>,
    #[serde(rename = "shippingFee")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shipping_fee: Option<String>,
    #[serde(rename = "shippingAddressMasked")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shipping_address_masked: Option<String>,
}

/// X-PAYMENTヘッダーのペイロード
#[derive(Debug, Deserialize)]
#[allow(dead_code)] // 将来の拡張で使用予定
pub struct PaymentPayload {
    #[serde(rename = "x402Version")]
    pub x402_version: i32,
    pub scheme: String,
    pub network: String,
    pub payload: PaymentPayloadData,
}

/// 決済ペイロードデータ
#[derive(Debug, Deserialize)]
#[allow(dead_code)] // 将来の拡張で使用予定
pub struct PaymentPayloadData {
    #[serde(rename = "paymentId")]
    pub payment_id: String,
    pub payer: String,
    pub recipient: String,
    pub amount: String,
    pub duration: i64,
    pub deadline: String,
    pub nonce: String,
    #[serde(rename = "permitSignature")]
    pub permit_signature: Signature,
    #[serde(rename = "paymentSignature")]
    pub payment_signature: Signature,
}

/// 署名
#[derive(Debug, Deserialize)]
#[allow(dead_code)] // 将来の拡張で使用予定
pub struct Signature {
    pub v: i32,
    pub r: String,
    pub s: String,
}

/// ユーザー情報取得のクエリパラメータ
#[derive(Debug, Deserialize)]
pub struct GetUserQuery {
    #[serde(rename = "includeHistory")]
    #[serde(default = "default_include_history")]
    pub include_history: bool,
    #[serde(rename = "historyLimit")]
    #[serde(default = "default_history_limit")]
    pub history_limit: i32,
}

fn default_include_history() -> bool {
    true
}

fn default_history_limit() -> i32 {
    10
}

/// ユーザー情報（APIレスポンス用）
#[typeshare]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserInformation {
    #[serde(rename = "userId")]
    pub user_id: String,
    #[serde(rename = "walletId")]
    pub wallet_id: String,
    pub balances: Vec<Balance>,
    #[serde(rename = "purchaseHistory")]
    pub purchase_history: Vec<Purchase>,
}

/// 通貨残高情報
#[typeshare]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Balance {
    pub currency: String, // トークンコントラクトアドレス
    #[serde(rename = "currencyName")]
    pub currency_name: String,
    pub balance: String, // wei単位の文字列
    pub decimals: i32,
}

/// 購入履歴情報
#[typeshare]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Purchase {
    #[serde(rename = "orderId")]
    pub order_id: String,
    pub sku: String,
    #[serde(rename = "productName")]
    pub product_name: String,
    pub quantity: i32,
    pub amount: String, // wei単位の文字列
    pub currency: String, // トークンコントラクトアドレス
    pub status: OrderStatus,
    #[serde(rename = "purchasedAt")]
    pub purchased_at: String, // ISO 8601形式
}

pub mod db;
pub mod mapper;

