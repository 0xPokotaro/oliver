"use client";

import { useMutation } from "@tanstack/react-query";
import {
  usePrivyWalletClient,
  usePrivyWallet,
  useSessionSigner,
} from "@/hooks/wallet";
import {
  createMultichainOrchestrator,
  createSessionsMeeClient,
} from "@/lib/smart-account/orchestrator";
import { prepareSmartAccountPermissions } from "@/lib/smart-account/permissions";
import { SMART_ACCOUNT_CONFIG } from "@/lib/config";

/**
 * Smart Account のセットアップを実行するフック
 * container.tsx と use-set-smart-account.ts のロジックを統合
 */
export const useSmartAccountSetup = () => {
  const walletClient = usePrivyWalletClient();
  const { wallet, error: walletError } = usePrivyWallet();
  const sessionSigner = useSessionSigner();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!walletClient || !wallet || !sessionSigner) {
        throw new Error(
          walletError?.message || "Wallet or session signer not available",
        );
      }

      // 1. マルチチェーンオーケストレータの作成
      const orchestrator = await createMultichainOrchestrator(
        walletClient,
        wallet.address as `0x${string}`,
      );

      // 2. Sessions MEE クライアントの作成
      const sessionsMeeClient = await createSessionsMeeClient(orchestrator);

      // 3. パーミッションの準備
      const payload = await prepareSmartAccountPermissions(
        sessionsMeeClient,
        sessionSigner,
        SMART_ACCOUNT_CONFIG.feeToken,
        SMART_ACCOUNT_CONFIG.trigger,
      );

      return { payload, sessionsMeeClient };
    },
    onError: (error) => {
      console.error("Error setting up smart account:", error);
    },
  });

  return {
    setupSmartAccount: mutation.mutate,
    setupSmartAccountAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
};
