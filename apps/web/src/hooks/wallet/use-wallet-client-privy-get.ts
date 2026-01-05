"use client";

import { useState, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom } from "viem";
import { baseSepolia } from "viem/chains";
import type { WalletClient } from "viem";

/**
 * Privy のウォレットから viem の WalletClient を作成するフック
 * @returns WalletClient | null
 */
export const usePrivyWalletClient = () => {
  const { wallets } = useWallets();
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  useEffect(() => {
    const initWalletClient = async () => {
      // Privy の Embedded Wallet を取得
      const embeddedWallet = wallets.find(
        (wallet) => wallet.walletClientType === "privy",
      );

      if (!embeddedWallet) {
        setWalletClient(null);
        return;
      }

      try {
        // Privy ウォレットから EIP-1193 Provider を取得
        const provider = await embeddedWallet.getEthereumProvider();

        // viem の WalletClient を作成
        const client = createWalletClient({
          chain: baseSepolia,
          transport: custom(provider),
        });

        setWalletClient(client);
      } catch (error) {
        console.error("Failed to create wallet client:", error);
        setWalletClient(null);
      }
    };

    initWalletClient();
  }, [wallets]);

  return walletClient;
};
