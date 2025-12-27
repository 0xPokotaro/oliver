"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getAuthToken,
  useDynamicContext,
  useWalletOptions,
  useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";
import { login } from "@/lib/auth/client";

interface UseLoginOptions {
  walletType?: string;
  redirectPath?: string;
}

interface UseLoginReturn {
  handleLogin: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useLogin(options: UseLoginOptions = {}): UseLoginReturn {
  const { walletType = "metamask", redirectPath = "/" } = options;

  const router = useRouter();
  const { handleLogOut } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { selectWalletOption } = useWalletOptions();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const performLogin = useCallback(
    async (authToken: string) => {
      await login(authToken);
      router.push(redirectPath);
    },
    [router, redirectPath]
  );

  const handleWalletConnection = useCallback(async () => {
    await selectWalletOption(walletType);
    const authToken = getAuthToken();

    if (authToken) {
      await performLogin(authToken);
    }
  }, [selectWalletOption, walletType, performLogin]);

  const handleLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Dynamicでログインしていない場合は、まずウォレットを接続
      if (!isLoggedIn) {
        await handleWalletConnection();
        return;
      }

      // Dynamicでログイン済みの場合、バックエンドAPIにログイン
      const authToken = getAuthToken();

      if (!authToken) {
        throw new Error("Failed to get authentication token from Dynamic");
      }

      await performLogin(authToken);
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Login failed";

      // JWTトークンエラーの場合は強制ログアウト
      if (errorMessage.includes("Invalid or expired JWT token")) {
        await handleLogOut();
        return;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, handleWalletConnection, performLogin, handleLogOut]);

  return {
    handleLogin,
    isLoading,
    error,
    clearError,
  };
}
