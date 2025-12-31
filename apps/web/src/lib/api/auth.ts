import { client } from '@/lib/hono';
import { handleApiError } from '@/lib/errors/api-error-handler';

/**
 * ユーザーログインを実行する
 * Privy認証後の初回アクセス時、またはユーザー未登録時に呼び出される
 * @param authToken - 認証トークン
 * @param walletAddress - ウォレットアドレス
 * @returns ログイン結果
 * @throws ApiError - ログイン失敗時
 */
export async function loginUser(authToken: string, walletAddress: string) {
  const response = await client.api.auth.login.$post({
    json: {
      authToken,
      walletAddress,
    }
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}
