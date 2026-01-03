import { baseSepolia } from "viem/chains";
import { http } from "viem";

export const SUPPORTED_CHAIN = baseSepolia;
export const CHAIN_ID = baseSepolia.id;

export const CHAIN_CONFIG = {
  chain: baseSepolia,
  transport: http(),
} as const;
