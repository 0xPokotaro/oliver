/**
 * X402決済ミドルウェア
 */

import { verifyPayment, settlePayment } from "../facilitator/client";
import type {
  PaymentPayload,
  PaymentRequiredResponse,
  PaymentInfo,
  X402Config,
  X402MiddlewareResult,
} from "../types/x402-types";

/**
 * 環境変数からX402設定を取得
 */
export function getX402Config(): X402Config {
  const payTo = process.env.X402_PAY_TO;
  const asset = process.env.X402_ASSET;
  const maxAmountRequired = process.env.X402_MAX_AMOUNT_REQUIRED;
  const network = process.env.X402_NETWORK || "localhost";
  const maxTimeoutSeconds = Number.parseInt(
    process.env.X402_MAX_TIMEOUT_SECONDS || "3600",
    10,
  );
  const facilitatorUrl = process.env.FACILITATOR_URL || "http://localhost:8403";
  const description =
    process.env.X402_DESCRIPTION || "Access to protected resource";

  if (!payTo) {
    throw new Error("X402_PAY_TO environment variable is not set");
  }
  if (!asset) {
    throw new Error("X402_ASSET environment variable is not set");
  }
  if (!maxAmountRequired) {
    throw new Error("X402_MAX_AMOUNT_REQUIRED environment variable is not set");
  }

  return {
    payTo,
    asset,
    maxAmountRequired,
    network,
    maxTimeoutSeconds,
    facilitatorUrl,
    description,
  };
}

/**
 * 402 Payment Required レスポンスを生成
 */
function createPaymentRequiredResponse(
  config: X402Config,
  resource: string,
  error?: string,
): PaymentRequiredResponse {
  return {
    x402Version: 1,
    accepts: [
      {
        scheme: "evm-permit",
        network: config.network,
        maxAmountRequired: config.maxAmountRequired,
        resource,
        description: config.description,
        payTo: config.payTo,
        asset: config.asset,
        maxTimeoutSeconds: config.maxTimeoutSeconds,
      },
    ],
    error: error || "Payment required",
  };
}

/**
 * Base64文字列をデコードしてPaymentPayloadに変換
 */
function decodePaymentPayload(base64Payload: string): PaymentPayload {
  try {
    const decoded = Buffer.from(base64Payload, "base64").toString("utf-8");
    const payload = JSON.parse(decoded) as PaymentPayload;
    return payload;
  } catch (error) {
    throw new Error(`Invalid payment payload: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * X402ミドルウェア関数
 * @param requestHeaders リクエストヘッダー
 * @param resourcePath リソースパス（例: "/protected/resource"）
 * @param config X402設定（省略時は環境変数から取得）
 * @returns ミドルウェアの結果
 */
export async function x402Middleware(
  requestHeaders: Headers,
  resourcePath: string,
  config?: X402Config,
): Promise<X402MiddlewareResult> {
  const x402Config = config || getX402Config();

  // X-PAYMENTヘッダーの確認
  const paymentHeader = requestHeaders.get("X-PAYMENT");

  if (!paymentHeader) {
    // 決済ヘッダーがない場合は402レスポンスを返す
    return {
      success: false,
      errorResponse: createPaymentRequiredResponse(
        x402Config,
        resourcePath,
        "Payment required",
      ),
    };
  }

  try {
    // Base64デコードしてPaymentPayloadに変換
    const paymentPayload = decodePaymentPayload(paymentHeader);

    // Facilitatorで検証
    const verifyResult = await verifyPayment(paymentHeader);

    if (!verifyResult.valid) {
      return {
        success: false,
        errorResponse: createPaymentRequiredResponse(
          x402Config,
          resourcePath,
          "Invalid payment intent signature",
        ),
      };
    }

    // 金額の整合性チェック
    const paymentAmount = BigInt(verifyResult.amount);
    const requiredAmount = BigInt(x402Config.maxAmountRequired);

    if (paymentAmount < requiredAmount) {
      return {
        success: false,
        errorResponse: createPaymentRequiredResponse(
          x402Config,
          resourcePath,
          "Insufficient payment amount",
        ),
      };
    }

    // 検証成功 - Optimistic Response
    // /settleは非同期で実行（Fire-and-Forget）
    settlePayment(paymentHeader).catch((error) => {
      console.error("Background settlement failed:", error);
    });

    // 決済情報を返す
    const paymentInfo: PaymentInfo = {
      paymentId: verifyResult.paymentId,
      payer: verifyResult.payer,
      amount: verifyResult.amount,
    };

    return {
      success: true,
      paymentInfo,
    };
  } catch (error) {
    // エラーハンドリング
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Facilitator接続エラーなどの場合は500エラーを返すべきだが、
    // ここでは402として扱う（仕様に従う）
    return {
      success: false,
      errorResponse: createPaymentRequiredResponse(
        x402Config,
        resourcePath,
        errorMessage,
      ),
    };
  }
}

