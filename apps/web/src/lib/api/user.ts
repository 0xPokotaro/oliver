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

/**
 * 音声ファイルをアップロードして音声コマンドを実行する
 * @param authToken - 認証トークン
 * @param audioFile - WAV形式の音声ファイル
 * @returns 音声コマンド実行結果（textフィールドに解析されたテキストが含まれる）
 * @throws ApiError - APIエラー
 */
export async function uploadVoiceFile(authToken: string, audioFile: File): Promise<{ success: true; text: string } | { success: false; error: string; code?: string }> {
  const formData = new FormData();
  formData.append('audio', audioFile);

  // honoクライアントのformプロパティはFormDataを正しく処理しないため、fetch APIを直接使用
  const response = await fetch('/api/users/voice', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}
