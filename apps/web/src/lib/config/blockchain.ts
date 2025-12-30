import { avalanche } from 'viem/chains';
import { http } from 'viem';

export const SUPPORTED_CHAIN = avalanche;
export const CHAIN_ID = avalanche.id;

export const CHAIN_CONFIG = {
  chain: avalanche,
  transport: http(),
} as const;
