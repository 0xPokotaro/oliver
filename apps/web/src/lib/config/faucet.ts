import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import type { WalletClient } from "viem";

/**
 * Faucet Walletの秘密鍵を環境変数から取得
 */
export const getFaucetWalletPrivateKey = (): `0x${string}` => {
  const key = process.env.NEXT_PUBLIC_FAUCET_PRIVATE_KEY;

  if (!key) {
    throw new Error("Faucet wallet private key not configured");
  }

  return key as `0x${string}`;
};

/**
 * Faucet WalletからWalletClientを作成
 */
export const createFaucetWalletClient = (): WalletClient => {
  const privateKey = getFaucetWalletPrivateKey();
  const account = privateKeyToAccount(privateKey);

  return createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });
};
