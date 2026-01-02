"use client";

import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { uploadVoiceFile, type AgentResponse } from "@/lib/api/user";

type UploadVoiceResponse = {
  success: true;
} & AgentResponse;

/**
 * 音声ファイルをアップロードして音声コマンドを実行するフック
 */
export const useUploadVoice = () => {
  const { getAccessToken } = usePrivy();

  const mutation = useMutation<UploadVoiceResponse, Error, File>({
    mutationFn: async (audioFile: File) => {
      const authToken = await getAccessToken();
      if (!authToken) {
        throw new Error("認証トークンが取得できませんでした。");
      }

      const result = await uploadVoiceFile(authToken, audioFile);

      if (result.success) {
        return result;
      } else {
        throw new Error(
          result.error || "音声ファイルのアップロードに失敗しました。",
        );
      }
    },
  });

  return {
    uploadVoice: mutation.mutate,
    uploadVoiceAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};
