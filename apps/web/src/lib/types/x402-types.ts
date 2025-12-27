/**
 * X402決済プロトコルの型定義
 */

/**
 * EIP-712署名の構造
 */
export interface Signature {
  v: number;
  r: string;
  s: string;
}

/**
 * 決済ペイロードの内部構造
 */
export interface PaymentPayloadData {
  paymentId: string;
  payer: string;
  recipient: string;
  amount: string; // wei単位の文字列
  duration: number; // 秒
  deadline: string; // Unix timestamp (文字列)
  nonce: string;
  permitSignature: Signature;
  paymentSignature: Signature;
}

/**
 * 決済ペイロード（X-PAYMENTヘッダーに含まれる）
 */
export interface PaymentPayload {
  x402Version: number;
  scheme: string;
  network: string;
  payload: PaymentPayloadData;
}

/**
 * 決済要件（402レスポンス）
 */
export interface PaymentAccept {
  scheme: string;
  network: string;
  maxAmountRequired: string; // wei単位の文字列
  resource: string;
  description: string;
  payTo: string;
  asset: string;
  maxTimeoutSeconds: number;
}

/**
 * 402 Payment Required レスポンス
 */
export interface PaymentRequiredResponse {
  x402Version: number;
  accepts: PaymentAccept[];
  error: string;
}

/**
 * Facilitator /verify レスポンス
 */
export interface VerifyResponse {
  valid: boolean;
  paymentId: string;
  payer: string;
  amount: string; // wei単位の文字列
}

/**
 * Facilitator /settle レスポンス
 */
export interface SettleResponse {
  txHash: string;
  paymentId: string;
  settled: boolean;
  blockNumber: string;
}

/**
 * 決済情報（ミドルウェアから返される）
 */
export interface PaymentInfo {
  paymentId: string;
  payer: string;
  amount: string;
  txHash?: string; // settleが完了した場合のみ
}

/**
 * X402ミドルウェアの設定
 */
export interface X402Config {
  payTo: string; // 受取人アドレス
  asset: string; // トークンコントラクトアドレス
  maxAmountRequired: string; // 最大必要額（wei）
  network: string; // ネットワーク名
  maxTimeoutSeconds: number; // タイムアウト（秒）
  facilitatorUrl: string; // Facilitator URL
  description: string; // リソースの説明
}

/**
 * ミドルウェアの結果
 */
export interface X402MiddlewareResult {
  success: boolean;
  paymentInfo?: PaymentInfo;
  errorResponse?: PaymentRequiredResponse;
}
