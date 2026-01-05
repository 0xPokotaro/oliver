"use client";

import { useMemo } from "react";
import { useWallets, type ConnectedWallet } from "@privy-io/react-auth";

interface UsePrivyWalletOptions {
  walletClientType?: string; // デフォルト: 'privy'
  index?: number; // デフォルト: undefined（タイプで検索）
}

interface UsePrivyWalletReturn {
  wallet: ConnectedWallet | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Privyウォレットを取得するカスタムフック
 *
 * @param options - ウォレット取得オプション
 * @param options.walletClientType - 検索するウォレットタイプ（デフォルト: 'privy'）
 * @param options.index - インデックス指定（指定時はタイプ検索をスキップ）
 * @returns ウォレット、ローディング状態、エラー
 */
export const usePrivyWallet = (
  options: UsePrivyWalletOptions = {},
): UsePrivyWalletReturn => {
  const { wallets } = useWallets();
  const { walletClientType = "privy", index } = options;

  const result = useMemo(() => {
    // ウォレットがまだ読み込まれていない場合
    if (!wallets || wallets.length === 0) {
      return {
        wallet: null,
        isLoading: true,
        error: null,
      };
    }

    // インデックス指定がある場合は、そのインデックスのウォレットを返す
    if (index !== undefined) {
      const wallet = wallets[index] || null;
      return {
        wallet,
        isLoading: false,
        error: wallet ? null : new Error(`Wallet at index ${index} not found`),
      };
    }

    // タイプで検索
    const wallet = wallets.find((w) => w.walletClientType === walletClientType);

    // Privyタイプが見つからない場合、フォールバックとして最初のウォレットを返す
    if (!wallet && walletClientType === "privy") {
      const fallbackWallet = wallets[0] || null;
      return {
        wallet: fallbackWallet,
        isLoading: false,
        error: fallbackWallet ? null : new Error("No wallets available"),
      };
    }

    return {
      wallet: wallet || null,
      isLoading: false,
      error: wallet
        ? null
        : new Error(`Wallet with type '${walletClientType}' not found`),
    };
  }, [wallets, walletClientType, index]);

  return result;
};
