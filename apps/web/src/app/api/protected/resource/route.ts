import { NextResponse } from "next/server";
import { x402Middleware } from "@/lib/x402/middleware";

/**
 * GET /api/protected/resource
 * X402決済プロトコルを使用した保護されたリソースエンドポイント
 */
export async function GET(request: Request) {
  const headers = request.headers;
  const resourcePath = "/api/protected/resource";

  // X402ミドルウェアで決済を検証
  const result = await x402Middleware(headers, resourcePath);

  if (!result.success) {
    // 決済が必要または検証失敗
    return NextResponse.json(result.errorResponse, { status: 402 });
  }

  // 決済成功 - リソースを返す
  const paymentInfo = result.paymentInfo!;

  // X-PAYMENT-RESPONSEヘッダーに決済情報を含める
  const response = NextResponse.json({
    data: "Protected content",
    payment: paymentInfo,
  });

  response.headers.set(
    "X-PAYMENT-RESPONSE",
    JSON.stringify({
      paymentId: paymentInfo.paymentId,
      payer: paymentInfo.payer,
      amount: paymentInfo.amount,
    }),
  );

  return response;
}

