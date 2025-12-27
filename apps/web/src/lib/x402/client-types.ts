/**
 * X402クライアント側の型定義
 */

import type { WalletClient, PublicClient } from "viem";

/**
 * createX402PaymentHeaderのオプション
 */
export interface CreateX402PaymentHeaderOptions {
  tokenAddress: string; // トークンコントラクトアドレス
  tokenName: string; // トークン名（例: "Qualia USD"）
  escrowAddress: string; // エスクローコントラクトアドレス
  chainId: number; // チェーンID
  recipient: string; // 受取人アドレス
  amountUSD: number; // 決済金額（USD単位、例: 100 = 100 QUSD）
  durationSeconds: number; // 有効期間（秒）
  walletClient: WalletClient; // viemのWalletClient
  publicClient: PublicClient; // viemのPublicClient
}

/**
 * fetchWithX402のオプション
 */
export interface FetchWithX402Options {
  tokenAddress: string; // トークンコントラクトアドレス
  tokenName: string; // トークン名
  escrowAddress: string; // エスクローコントラクトアドレス
  chainId: number; // チェーンID
  walletClient: WalletClient; // viemのWalletClient
  publicClient: PublicClient; // viemのPublicClient
}

/**
 * createX402PaymentHeaderの戻り値
 */
export interface CreateX402PaymentHeaderResult {
  paymentHeader: string; // Base64エンコードされた決済ヘッダー
  paymentId: string; // 決済ID
}
