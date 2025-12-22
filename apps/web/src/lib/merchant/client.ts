/**
 * Merchant APIクライアント
 */

import type { Product } from "@/lib/types";

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

