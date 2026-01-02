import { usePrivy, useWallets } from "@privy-io/react-auth";
import { loginUser } from "@/lib/api/auth";
import { fetchUserProfile } from "@/lib/api/user";

/**
 * 自動ログイン処理を実行するフック
 * UserNotFoundError（401 + "User not found"）発生時に使用
 */
export const useAutoLogin = () => {
  const { getAccessToken, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();

  /**
   * 自動ログインを実行し、プロフィールを再取得
   * @returns ユーザープロフィールデータ
   */
  const performAutoLogin = async () => {
    if (!ready || !authenticated) {
      throw new Error("User is not authenticated. Please sign in first.");
    }

    const walletAddress = wallets[0]?.address;
    if (!walletAddress) {
      throw new Error(
        "Wallet address not found. Please connect a wallet first.",
      );
    }

    const authToken = await getAccessToken();
    if (!authToken) {
      throw new Error("No authentication token available");
    }

    // ログイン実行
    await loginUser(authToken, walletAddress);

    // プロフィール再取得
    return fetchUserProfile(authToken);
  };

  return { performAutoLogin };
};
