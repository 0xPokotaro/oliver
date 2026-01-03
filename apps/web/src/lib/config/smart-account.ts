import { parseUnits, http } from "viem";
import { baseSepolia } from "viem/chains";
import { TOKEN_ADDRESSES } from "./constants";
import { getMEEVersion, MEEVersion } from "@biconomy/abstractjs";

export const SMART_ACCOUNT_CONFIG = {
  meeVersion: getMEEVersion(MEEVersion.V2_2_1),
  transport: http(),
  feeToken: {
    address: TOKEN_ADDRESSES.JPYC,
    chainId: baseSepolia.id,
  },
  trigger: {
    tokenAddress: TOKEN_ADDRESSES.JPYC,
    chainId: baseSepolia.id,
    amount: parseUnits("10", 6),
  },
} as const;

// セッション署名者の秘密鍵を取得
export const getSessionSignerPrivateKey = (): `0x${string}` => {
  const key =
    process.env.NEXT_PUBLIC_PRIVY_PRIVATE_KEY ||
    process.env.NEXT_PUBLIC_DYNAMIC_PRIVATE_KEY;

  if (!key) {
    throw new Error("Session signer private key not configured");
  }

  return key as `0x${string}`;
};
