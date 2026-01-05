import { http } from "viem";
import { baseSepolia } from "viem/chains";
import { getMEEVersion, MEEVersion, type ChainConfiguration } from "@biconomy/abstractjs";
import { CONTRACT_ADDRESSES } from "./blockchain";

export const NEXUS_ACCOUNT_CONFIG = {
  BASE_SEPOLIA: {
    chain: baseSepolia,
    transport: http(),
    version: getMEEVersion(MEEVersion.V2_1_0),
  } as ChainConfiguration,
} as const;

export const FEE_TOKEN = {
  address: CONTRACT_ADDRESSES.BASE_SEPOLIA.USDC,
  chainId: baseSepolia.id,
} as const;
