"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { client } from "@/lib/hono";

interface CreateSmartAccountResponse {
  id: string;
  privyUserId: string;
  walletAddress: string;
  smartAccountAddress: string;
}

export const useCreateSmartAccount = () => {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();

  const mutation = useMutation<CreateSmartAccountResponse, Error, void>({
    mutationFn: async () => {
      // 1. authTokenを取得
      const authToken = await getAccessToken();
      if (!authToken) {
        throw new Error("No authentication token available");
      }

      // 2. スマートアカウント作成APIを実行
      const response = await client.api.users['smart-account'].$post({
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
      if ("error" in data && !("id" in data)) {
        const errorData = data as { error?: unknown };
        const errorMessage =
          typeof errorData.error === "string" ? errorData.error : "Failed to create smart account";
        throw new Error(errorMessage);
      }

      // 6. 成功レスポンスを返す
      if (
        "id" in data &&
        "privyUserId" in data &&
        "walletAddress" in data &&
        "smartAccountAddress" in data
      ) {
        return data as CreateSmartAccountResponse;
      }

      throw new Error("Invalid response format");
    },
    onSuccess: () => {
      // 7. 成功時にuser-profileクエリを無効化して再取得をトリガー
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  return {
    createSmartAccount: mutation.mutate,
    createSmartAccountAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};

