import { client } from '@/lib/hono';
import { handleApiError } from '@/lib/errors/api-error-handler';

/**
 * ユーザープロフィールを取得する
 * @param authToken - 認証トークン
 * @returns ユーザープロフィールデータ
 * @throws UserNotFoundError - ユーザーが未登録の場合（401 + "User not found"）
 * @throws ApiError - その他のAPIエラー
 */
export async function fetchUserProfile(authToken: string) {
  const response = await client.api.users.profile.$get({
    header: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

/**
 * サーバー側でスマートアカウントを作成する
 * @param authToken - 認証トークン
 * @returns スマートアカウント作成結果
 * @throws ApiError - APIエラー
 */
export async function createSmartAccountOnServer(authToken: string) {
  const response = await client.api.users['smart-account'].$post({
    header: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}
