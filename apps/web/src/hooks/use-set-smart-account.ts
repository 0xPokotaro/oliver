'use client';

import { useMutation } from '@tanstack/react-query';
import { useWallets } from '@privy-io/react-auth';
import { useWalletClient } from 'wagmi';
import { privateKeyToAccount } from 'viem/accounts';
import {
  toMultichainNexusAccount,
  createMeeClient,
  meeSessionActions,
  toSmartSessionsModule,
} from '@biconomy/abstractjs';
import {
  SUPPORTED_CHAIN,
  SMART_ACCOUNT_CONFIG,
  getSessionSignerPrivateKey,
} from '@/lib/config';

interface SetSmartAccountResponse {
  payload: any; // BiconomyのprepareForPermissionsの戻り値型
  sessionsMeeClient: any;
}

export const useSetSmartAccount = () => {
  const { wallets } = useWallets();
  const { data: walletClient } = useWalletClient();

  const mutation = useMutation<SetSmartAccountResponse, Error, void>({
    mutationFn: async () => {
      // 1. ウォレット検証
      const wallet = wallets[0];
      if (!wallet || !walletClient) {
        throw new Error('Wallet or wallet client is not available');
      }

      console.log('set smart account');
      console.log('walletClient: ', walletClient);

      // 2. セッション署名者の初期化
      const sessionSigner = privateKeyToAccount(getSessionSignerPrivateKey());

      // 3. Smart Sessions バリデータの作成
      const ssValidator = toSmartSessionsModule({
        signer: sessionSigner,
      });

      // 4. マルチチェーン Nexus アカウントの作成
      const orchestrator = await toMultichainNexusAccount({
        chainConfigurations: [
          {
            chain: SUPPORTED_CHAIN,
            transport: SMART_ACCOUNT_CONFIG.transport,
            version: SMART_ACCOUNT_CONFIG.meeVersion,
            accountAddress: wallet.address as `0x${string}`,
          },
        ],
        signer: walletClient,
      });

      // 5. MEE クライアントの作成
      const meeClient = await createMeeClient({
        account: orchestrator,
      });

      // 6. Smart Sessions の拡張
      const sessionsMeeClient = meeClient.extend(meeSessionActions);

      console.log('sessionsMeeClient: ', sessionsMeeClient);

      // 7. パーミッションの準備
      const payload = await sessionsMeeClient.prepareForPermissions({
        smartSessionsValidator: ssValidator,
        feeToken: SMART_ACCOUNT_CONFIG.feeToken,
        trigger: SMART_ACCOUNT_CONFIG.trigger,
      });

      return { payload, sessionsMeeClient };
    },
    onError: (error) => {
      console.error('Error setting smart account:', error);
    },
  });

  return {
    setSmartAccount: mutation.mutate,
    setSmartAccountAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};
