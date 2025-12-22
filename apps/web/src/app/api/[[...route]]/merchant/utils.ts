import type { Context } from 'hono'

/**
 * Merchant APIのベースURLを取得
 * 環境変数のバリデーションも行う
 */
export function getMerchantApiUrl(): string {
  const merchantApiUrl = process.env.NEXT_PUBLIC_MERCHANT_API_URL;
  if (!merchantApiUrl) {
    throw new Error('NEXT_PUBLIC_MERCHANT_API_URL environment variable is not set');
  }
  return merchantApiUrl;
}

/**
 * シンプルなGETリクエストのプロキシ
 * エラーハンドリングを含む
 */
export async function proxyRequest(
  url: string,
  context: Context,
  errorPrefix: string
): Promise<Response> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      return context.json(
        { error: `${errorPrefix}: ${response.status} ${errorText}` },
        response.status as 200 | 400 | 401 | 403 | 404 | 500
      );
    }
    
    const data = await response.json();
    return context.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return context.json({ error: `${errorPrefix}: ${message}` }, 500);
  }
}

/**
 * ボディ付きリクエストのプロキシ
 * X-PAYMENTヘッダー転送対応
 * 402 Payment Requiredの特別処理を含む
 */
export async function proxyRequestWithBody(
  url: string,
  method: string,
  body: unknown,
  context: Context,
  errorPrefix: string,
  customHeaders?: HeadersInit
): Promise<Response> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    
    // X-PAYMENTヘッダーを転送
    const paymentHeader = context.req.header('X-PAYMENT');
    if (paymentHeader) {
      headers['X-PAYMENT'] = paymentHeader;
    }
    
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    // 402 Payment Requiredは特別に処理
    if (response.status === 402) {
      return context.json(data, 402);
    }
    
    if (!response.ok) {
      return context.json(
        { error: `${errorPrefix}: ${response.status} ${JSON.stringify(data)}` },
        response.status as 200 | 400 | 401 | 403 | 404 | 500
      );
    }
    
    return context.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return context.json({ error: `${errorPrefix}: ${message}` }, 500);
  }
}

