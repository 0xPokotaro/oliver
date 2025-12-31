/**
 * Smart Account のパーミッション設定
 */

import type { PrivateKeyAccount } from 'viem/accounts';
import { createSmartSessionsValidator } from './orchestrator';

/**
 * Smart Account のパーミッションを準備
 * @param sessionsMeeClient - Smart Sessions 拡張済みの MEE クライアント
 * @param sessionSigner - セッション署名者アカウント
 * @param feeToken - ガス代支払いトークン設定
 * @param trigger - 権限トリガー設定
 */
export async function prepareSmartAccountPermissions(
  sessionsMeeClient: any,
  sessionSigner: PrivateKeyAccount,
  feeToken: { address: `0x${string}`; chainId: number },
  trigger: { tokenAddress: `0x${string}`; chainId: number; amount: bigint }
) {
  const ssValidator = createSmartSessionsValidator(sessionSigner);

  return sessionsMeeClient.prepareForPermissions({
    smartSessionsValidator: ssValidator,
    feeToken,
    trigger,
  });
}
