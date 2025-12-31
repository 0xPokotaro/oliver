import { useQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { fetchUserProfile } from '@/lib/api/user';
import { UserNotFoundError } from '@/lib/errors/error-types';
import { useAutoLogin } from './use-auto-login';

/**
 * ユーザープロフィールを取得するフック
 * 自動ログイン処理を統合（UserNotFoundError時に自動実行）
 */
export const useUserProfile = () => {
  const { getAccessToken } = usePrivy();
  const { performAutoLogin } = useAutoLogin();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    retry: false, // 自動リトライを無効化（手動でログイン処理を実行するため）
    queryFn: async () => {
      const authToken = await getAccessToken();
      if (!authToken) {
        throw new Error('No authentication token available');
      }

      try {
        return await fetchUserProfile(authToken);
      } catch (error) {
        // USER_NOT_FOUNDの場合、自動ログインを実行
        if (error instanceof UserNotFoundError) {
          return await performAutoLogin();
        }
        throw error;
      }
    },
  });

  return { data, isLoading, error };
};
