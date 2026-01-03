"use client";

import { useState, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { useSessionSigner } from "@/hooks/wallet";
import { checkSmartAccountStatus } from "@/lib/smart-account/status-checker";

/**
 * Smart Account の設定状態をチェックするフック
 * @returns isConfigured - 設定完了状態、isChecking - チェック中フラグ
 */
export const useSmartAccountStatus = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { wallets } = useWallets();
  const sessionSigner = useSessionSigner();

  useEffect(() => {
    const checkStatus = async () => {
      const wallet = wallets.find((wallet) => wallet.address);
      console.log("checkStatus", wallet, sessionSigner);
      if (!wallet || !sessionSigner) {
        setIsConfigured(false);
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      const status = await checkSmartAccountStatus(wallet, sessionSigner);
      setIsConfigured(status);
      setIsChecking(false);
    };

    checkStatus();
  }, [wallets, sessionSigner]);

  return { isConfigured, isChecking };
};
