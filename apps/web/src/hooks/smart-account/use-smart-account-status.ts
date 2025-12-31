'use client';

import { useState, useEffect } from 'react';
import { usePrivyWalletClient, useSessionSigner } from '@/hooks/wallet';
import { checkSmartAccountStatus } from '@/lib/smart-account/status-checker';

/**
 * Smart Account の設定状態をチェックするフック
 * @returns isConfigured - 設定完了状態、isChecking - チェック中フラグ
 */
export const useSmartAccountStatus = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const walletClient = usePrivyWalletClient();
  const sessionSigner = useSessionSigner();

  useEffect(() => {
    const checkStatus = async () => {
      console.log("checkStatus", walletClient, sessionSigner)
      if (!walletClient || !sessionSigner) {
        setIsConfigured(false);
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      const status = await checkSmartAccountStatus(walletClient, sessionSigner);
      setIsConfigured(status);
      setIsChecking(false);
    };

    checkStatus();
  }, [walletClient, sessionSigner]);

  return { isConfigured, isChecking };
};
