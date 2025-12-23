/**
 * Facilitator APIクライアント
 */

import type { VerifyResponse, SettleResponse } from "@/lib/types";

/**
 * Facilitator APIのベースURL
 */
function getFacilitatorUrl(): string {
  const url = process.env.FACILITATOR_URL;
  if (!url) {
    throw new Error("FACILITATOR_URL environment variable is not set");
  }
  return url;
}

/**
 * 決済を検証する
 * @param paymentPayload Base64エンコードされた決済ペイロード
 * @returns 検証結果
 */
export async function verifyPayment(
  paymentPayload: string,
): Promise<VerifyResponse> {
  const facilitatorUrl = getFacilitatorUrl();
  const url = `${facilitatorUrl}/verify`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment: paymentPayload,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Facilitator verify failed: ${response.status} ${errorText}`,
      );
    }

    const data = (await response.json()) as VerifyResponse;
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to verify payment: ${error.message}`);
    }
    throw new Error("Failed to verify payment: Unknown error");
  }
}

/**
 * 決済を実行する（非同期、Fire-and-Forget）
 * @param paymentPayload Base64エンコードされた決済ペイロード
 * @returns Promise（エラーはログに記録される）
 */
export async function settlePayment(
  paymentPayload: string,
): Promise<void> {
  const facilitatorUrl = getFacilitatorUrl();
  const url = `${facilitatorUrl}/settle`;

  // 非同期で実行（Fire-and-Forget）
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment: paymentPayload,
    }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Facilitator settle failed: ${response.status} ${errorText}`,
        );
        return;
      }

      const data = (await response.json()) as SettleResponse;
      console.log(`Payment settled: ${data.paymentId}, txHash: ${data.txHash}`);
    })
    .catch((error) => {
      console.error("Failed to settle payment:", error);
    });
}

