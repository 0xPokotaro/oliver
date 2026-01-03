/**
 * Biconomy Smart Account のオーケストレータ初期化ロジック
 * container.tsx と use-set-smart-account.ts の重複コードを統合
 */

import type { PrivateKeyAccount } from "viem/accounts";
import type { WalletClient } from "viem";
import {
  toMultichainNexusAccount,
  toSmartSessionsModule,
  createMeeClient,
  meeSessionActions,
} from "@biconomy/abstractjs";
import { baseSepolia } from "viem/chains";
import { http } from "viem";
import { getMEEVersion, MEEVersion } from "@biconomy/abstractjs";

/**
 * Smart Sessions バリデータを作成
 * @param sessionSigner - セッション署名者アカウント
 */
export function createSmartSessionsValidator(sessionSigner: PrivateKeyAccount) {
  return toSmartSessionsModule({
    signer: sessionSigner,
  });
}

/**
 * マルチチェーン Nexus アカウント（オーケストレータ）を作成
 * @param provider - Ethereum Provider（Wallet Client）
 * @param accountAddress - （オプション）既存のアカウントアドレス
 */
export async function createMultichainOrchestrator(wallet: any) {
  const config = {
    chainConfigurations: [
      {
        chain: baseSepolia,
        transport: http(),
        version: getMEEVersion(MEEVersion.V2_2_1),
      },
    ],
    signer: wallet.getEthereumProvider(),
  };

  console.log("config: ", config);
  return await toMultichainNexusAccount(config);
}

/**
 * MEE クライアントを作成し、Smart Sessions 機能を拡張
 * @param orchestrator - マルチチェーン Nexus アカウント
 */
export async function createSessionsMeeClient(orchestrator: any) {
  const meeClient = await createMeeClient({ account: orchestrator });
  return meeClient.extend(meeSessionActions);
}
