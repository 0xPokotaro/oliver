"use client";

import { useMutation } from "@tanstack/react-query";
import { useWalletOptions } from "@dynamic-labs/sdk-react-core";
import { getAuthToken } from "@dynamic-labs/sdk-react-core";
import { client } from "@/lib/hono";

interface LoginVariables {
  walletKey: string;
}

interface LoginResponse {
  userId: string;
  walletAddress: string;
}

export const useLogin = () => {
  const { selectWalletOption } = useWalletOptions();

  const mutation = useMutation<LoginResponse, Error, LoginVariables>({
    mutationFn: async ({ walletKey }) => {
      // 1. ウォレット接続
      await selectWalletOption(walletKey);

      // 2. authTokenを取得
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error("Failed to get authentication token");
      }

      // 3. ログインAPIを実行
      const response = await client.api.auth.login.$post({
        json: { authToken },
      });

      // 4. レスポンスを取得
      const data = await response.json();

      // 5. レスポンスの型チェック
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format");
      }

      // 6. エラーレスポンスの場合は例外を投げる
      if ("error" in data && !("userId" in data)) {
        const errorMessage =
          typeof data.error === "string" ? data.error : "Login failed";
        throw new Error(errorMessage);
      }

      // 7. 成功レスポンスを返す
      if ("userId" in data && "walletAddress" in data) {
        return data;
      }

      throw new Error("Invalid response format");
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};
