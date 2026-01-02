"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { client } from "@/lib/api/client";

interface RegisterBiconomySessionKeyResponse {
  success: boolean;
  sessionKeyAddress: string;
  message?: string;
}

export const useRegisterSessionKey = () => {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();

  const mutation = useMutation<
    RegisterBiconomySessionKeyResponse,
    Error,
    void
  >({
    mutationFn: async () => {
      // 1. authTokenを取得
      const authToken = await getAccessToken();
      if (!authToken) {
        throw new Error("No authentication token available");
      }

      // 2. Biconomy SessionKey登録APIを実行
      const response = await client.api.users["session-key"].$post({
        header: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // 3. レスポンスを取得
      const data = (await response.json()) as unknown;

      // 4. レスポンスの型チェック
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format");
      }

      // 5. エラーレスポンスの場合は例外を投げる
      if ("error" in data && !("success" in data)) {
        const errorData = data as { error?: unknown };
        const errorMessage =
          typeof errorData.error === "string"
            ? errorData.error
            : "Failed to register Biconomy session key";
        throw new Error(errorMessage);
      }

      // 6. 成功レスポンスを返す
      if (
        "success" in data &&
        "sessionKeyAddress" in data &&
        typeof data.success === "boolean"
      ) {
        return data as RegisterBiconomySessionKeyResponse;
      }

      throw new Error("Invalid response format");
    },
    onSuccess: () => {
      // 7. 成功時にuser-profileとaccountクエリを無効化して再取得をトリガー
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });

  return {
    registerSessionKey: mutation.mutate,
    registerSessionKeyAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};

