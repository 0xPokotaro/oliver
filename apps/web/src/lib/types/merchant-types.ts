/**
 * Merchant APIの型定義
 */

/**
 * 在庫ステータス
 */
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

/**
 * 注文ステータス
 */
export type OrderStatus =
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "failed";

/**
 * 商品情報（APIレスポンス用）
 */
export interface Product {
  id: string;
  name: string;
  price: string; // wei単位の文字列
  currency: string; // トークンコントラクトアドレス
  stockStatus: StockStatus;
  imageUrl: string;
  category?: string | null; // カテゴリ（例: "cat_food", "dog_food"など）
}

/**
 * 商品詳細情報（APIレスポンス用）
 */
export interface ProductDetail {
  id: string;
  name: string;
  description: string;
  price: string; // wei単位の文字列
  currency: string; // トークンコントラクトアドレス
  attributes: Record<string, unknown>; // JSONオブジェクト
  allowedTokens: string[]; // 支払い可能なトークン一覧
}

/**
 * 注文情報（APIレスポンス用）
 */
export interface Order {
  orderId: string;
  id: string | null;
  quantity: number;
  amount: string; // wei単位の文字列
  currency: string; // トークンコントラクトアドレス
  status: OrderStatus;
  trackingNumber: string | null; // 追跡番号（発送後に値が入る）
  createdAt: string; // ISO 8601形式
}

/**
 * 購入リクエストボディ
 */
export interface BuyRequest {
  quantity: number;
}

/**
 * 購入レスポンス（200 OK）
 */
export interface BuyResponse {
  status: string;
  orderId: string;
  message: string;
  estimatedArrival: string | null;
  payment: PaymentInfo;
}

/**
 * 決済情報
 */
export interface PaymentInfo {
  paymentId: string;
  payer: string;
  amount: string;
  txHash: string | null;
}

/**
 * 402 Payment Requiredレスポンス
 */
export interface PaymentRequiredResponse {
  x402Version: number;
  accepts: PaymentAccept[];
  error: string;
}

/**
 * 決済受け入れ情報
 */
export interface PaymentAccept {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  payTo: string;
  asset: string;
  maxTimeoutSeconds: number;
  chainId?: number | null;
  currency?: string | null;
  nonce?: string | null;
  deadline?: number | null;
  metadata?: PaymentMetadata | null;
}

/**
 * 決済メタデータ
 */
export interface PaymentMetadata {
  subtotal?: string | null;
  shippingFee?: string | null;
  shippingAddressMasked?: string | null;
}

/**
 * ヘルスチェックレスポンス
 */
export interface HealthResponse {
  status: string;
  version: string;
  chainConnection: boolean;
  timestamp: number;
}
