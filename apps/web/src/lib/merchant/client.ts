/**
 * Merchant APIクライアント
 */

import type { Product, BuyRequest } from "@/lib/types";

/**
 * Merchant APIのベースURL
 */
function getMerchantApiUrl(): string {
  const url = process.env.MERCHANT_API_URL;
  if (!url) {
    throw new Error("MERCHANT_API_URL environment variable is not set");
  }
  return url;
}

/**
 * 商品一覧を取得する
 * @param category カテゴリ（オプション）
 * @returns 商品一覧
 */
export async function getProducts(
  category?: string,
): Promise<Product[]> {
  const merchantApiUrl = getMerchantApiUrl();
  const url = new URL(`${merchantApiUrl}/api/v1/products`);

  if (category) {
    url.searchParams.set("category", category);
  }

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Merchant API getProducts failed: ${response.status} ${errorText}`,
      );
    }

    const data = (await response.json()) as Product[];
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get products: ${error.message}`);
    }
    throw new Error("Failed to get products: Unknown error");
  }
}

/**
 * 商品を購入する（1回目リクエスト: X-PAYMENTヘッダーなし）
 * @param productId 商品ID
 * @param request 購入リクエスト（数量）
 * @returns レスポンス（402 Payment Requiredまたは200 OK）
 */
export async function buyProduct(
  productId: string,
  request: BuyRequest,
): Promise<Response> {
  const merchantApiUrl = getMerchantApiUrl();
  const url = `${merchantApiUrl}/api/v1/products/${productId}/buy`;

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return response;
}

