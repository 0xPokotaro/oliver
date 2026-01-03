/**
 * Smart Account のデプロイ状態とモジュールインストール状態をチェック
 */

import type { PrivateKeyAccount } from "viem/accounts";
import type { WalletClient } from "viem";
import { isModuleInstalled } from "@biconomy/abstractjs";
import {
  createSmartSessionsValidator,
  createMultichainOrchestrator,
} from "./orchestrator";

/**
 * Smart Account の設定状態をチェック
 * すべてのデプロイメントがデプロイ済み & Smart Sessions モジュールがインストール済みかを確認
 * @param wallet - PrivyのConnectedWalletオブジェクト（getEthereumProvider()メソッドを持つ）
 * @param sessionSigner - セッション署名者アカウント
 * @returns すべて設定済みの場合 true
 */
export async function checkSmartAccountStatus(
  wallet: any,
  sessionSigner: PrivateKeyAccount,
): Promise<boolean> {
  try {
    const ssValidator = createSmartSessionsValidator(sessionSigner);
    const orchestrator = await createMultichainOrchestrator(wallet);

    // すべてのデプロイメントをチェック
    for (const deployment of orchestrator.deployments) {
      const isDeployed = await deployment.isDeployed();
      console.log("deployment: ", deployment);
      console.log("isDeployed: ", isDeployed);

      // @ts-ignore
      const isSsInstalled = await isModuleInstalled(deployment.client, {
        account: deployment,
        module: {
          address: ssValidator.address,
          initData: "0x",
          type: ssValidator.type,
        },
      });

      if (!isDeployed || !isSsInstalled) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking smart account status:", error);
    return false;
  }
}
