/**
 * Merchant APIクライアント
 */

import type {
  HealthResponse,
  Product,
  ProductDetail,
  Order,
  BuyResponse,
  PaymentRequiredResponse,
} from "../types/merchant-types";

/**
 * Merchant APIのベースURL
 */
function getMerchantApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_MERCHANT_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_MERCHANT_API_URL environment variable is not set");
  }
  return url;
}

/**
 * ヘルスチェック
 */
export async function getHealth(): Promise<HealthResponse> {
  const baseUrl = getMerchantApiUrl();
  const url = `${baseUrl}/api/v1/health`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Merchant API health check failed: ${response.status} ${errorText}`,
      );
    }

    return (await response.json()) as HealthResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to check health: ${error.message}`);
    }
    throw new Error("Failed to check health: Unknown error");
  }
}

/**
 * 商品一覧を取得
 * @param category カテゴリでフィルタリング（オプション）
 * @returns 商品一覧
 */
export async function getProducts(category?: string): Promise<Product[]> {
  const baseUrl = getMerchantApiUrl();
  const url = new URL(`${baseUrl}/api/v1/products`);
  if (category) {
    url.searchParams.set("category", category);
  }

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Merchant API getProducts failed: ${response.status} ${errorText}`,
      );
    }

    return (await response.json()) as Product[];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get products: ${error.message}`);
    }
    throw new Error("Failed to get products: Unknown error");
  }
}

/**
 * 商品詳細を取得
 * @param sku 商品SKU
 * @returns 商品詳細情報
 */
export async function getProductBySku(sku: string): Promise<ProductDetail> {
  const baseUrl = getMerchantApiUrl();
  const url = `${baseUrl}/api/v1/products/${encodeURIComponent(sku)}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Merchant API getProductBySku failed: ${response.status} ${errorText}`,
      );
    }

    return (await response.json()) as ProductDetail;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get product: ${error.message}`);
    }
    throw new Error("Failed to get product: Unknown error");
  }
}

/**
 * 商品を購入
 * @param sku 商品SKU
 * @param quantity 数量
 * @param paymentHeader X-PAYMENTヘッダー（オプション、未指定の場合は402レスポンスが返る可能性がある）
 * @returns 購入レスポンスまたは402 Payment Requiredレスポンス
 */
export async function buyProduct(
  sku: string,
  quantity: number,
  paymentHeader?: string,
): Promise<BuyResponse | PaymentRequiredResponse> {
  const baseUrl = getMerchantApiUrl();
  const url = `${baseUrl}/api/v1/products/${encodeURIComponent(sku)}/buy`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (paymentHeader) {
    headers["X-PAYMENT"] = paymentHeader;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ quantity }),
    });

    if (response.status === 402) {
      return (await response.json()) as PaymentRequiredResponse;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Merchant API buyProduct failed: ${response.status} ${errorText}`,
      );
    }

    return (await response.json()) as BuyResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to buy product: ${error.message}`);
    }
    throw new Error("Failed to buy product: Unknown error");
  }
}

/**
 * 注文情報を取得
 * @param orderId 注文ID
 * @returns 注文情報
 */
export async function getOrderById(orderId: string): Promise<Order> {
  const baseUrl = getMerchantApiUrl();
  const url = `${baseUrl}/api/v1/orders/${encodeURIComponent(orderId)}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Merchant API getOrderById failed: ${response.status} ${errorText}`,
      );
    }

    return (await response.json()) as Order;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get order: ${error.message}`);
    }
    throw new Error("Failed to get order: Unknown error");
  }
}

