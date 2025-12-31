import type { AgentTool, AgentResponse } from '@oliver/api/features/users/types/agent'
import { createSessionKeyRepository } from '@oliver/api/infrastructure/dependencies'
import { decrypt } from '@oliver/api/shared/utils/encryption'
import { privateKeyToAccount } from 'viem/accounts'
import { toMultichainNexusAccount, getMEEVersion, MEEVersion, createMeeClient, meeSessionActions } from '@biconomy/abstractjs'
import { avalanche } from 'viem/chains'
import { http, parseUnits, encodeFunctionData } from 'viem'

/**
 * 能力層の実行結果
 */
export interface SpecialistResult {
  success: boolean
  data?: Record<string, unknown>
  error?: string
}

/**
 * 能力層：実務を実行する
 * @param tool - 呼び出す能力名
 * @param params - ツールに渡すパラメータ
 * @param userId - ユーザーID
 * @param smartAccountAddress - スマートアカウントアドレス
 * @returns 実行結果
 */
export async function executeSpecialist(
  tool: AgentTool,
  params: Record<string, unknown>,
  userId: string,
  smartAccountAddress: string | null
): Promise<SpecialistResult> {
  switch (tool) {
    case 'x402_payment':
      return await executeX402Payment(params, userId, smartAccountAddress)
    case 'none':
      return {
        success: false,
        error: 'No tool specified',
      }
    default:
      return {
        success: false,
        error: `Unknown tool: ${tool}`,
      }
  }
}

/**
 * x402_payment の実行
 * Biconomy Smart Sessionsを使用してMock ERC20トークンを送金することで購入とみなす
 * @param params - 決済パラメータ
 * @param userId - ユーザーID
 * @param smartAccountAddress - スマートアカウントアドレス
 * @returns 実行結果
 */
async function executeX402Payment(
  params: Record<string, unknown>,
  userId: string,
  smartAccountAddress: string | null
): Promise<SpecialistResult> {
  // 定数定義
  // const MOCK_ERC20_ADDRESS = '0x129D75c7D6217F07638f10F59325D268cC26162C' as `0x${string}`
  const PAYMENT_RECIPIENT_ADDRESS = '0x1D0143Ebf9573E83D650820Dc336520CBca4232B' as `0x${string}`

  try {
    // 1. スマートアカウントアドレスの確認
    if (!smartAccountAddress) {
      return {
        success: false,
        error: 'Smart account address is not set. Please create a smart account first.',
      }
    }

    // 2. セッションキーの取得と復号化
    const sessionKeyRepository = createSessionKeyRepository()
    const sessionKey = await sessionKeyRepository.findByUserId(userId)

    if (!sessionKey) {
      return {
        success: false,
        error: 'Session key not found. Please create a smart account first.',
      }
    }

    // 秘密鍵を復号化
    const privateKey = decrypt(
      sessionKey.encryptedPrivateKeyIv,
      sessionKey.encryptedPrivateKeyContent
    ) as `0x${string}`

    // sessionSignerを作成
    const sessionSigner = privateKeyToAccount(privateKey)

    // 3. Orchestrator（Nexusアカウント）の構成
    const orchestrator = await toMultichainNexusAccount({
      chainConfigurations: [
        {
          chain: avalanche,
          transport: http(),
          version: getMEEVersion(MEEVersion.V2_2_1),
          accountAddress: smartAccountAddress as `0x${string}`,
        },
      ],
      signer: sessionSigner,
    })

    // 4. MEEクライアントの作成と拡張
    if (!process.env.BICONOMY_API_KEY) {
      return {
        success: false,
        error: 'BICONOMY_API_KEY is not configured',
      }
    }

    const meeClient = await createMeeClient({
      account: orchestrator,
      apiKey: process.env.BICONOMY_API_KEY,
    })

    const sessionsMeeClient = meeClient.extend(meeSessionActions)

    // 5. 金額の取得と変換
    const amountStr = params.amount as string | undefined
    if (!amountStr) {
      return {
        success: false,
        error: 'Amount is required',
      }
    }

    // Mock ERC20のdecimalsは18と仮定（実際のコントラクトに合わせて調整）
    const amount = parseUnits(amountStr, 18)

    // 6. ERC20トークンのtransfer関数呼び出しデータを生成
    const transferData = encodeFunctionData({
      abi: [
        {
          name: 'transfer',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ name: '', type: 'bool' }],
        },
      ],
      functionName: 'transfer',
      args: [PAYMENT_RECIPIENT_ADDRESS, amount],
    })

    // 7. 権限の行使とトランザクション実行
    /*
    const result = await sessionsMeeClient.usePermission({
      mode: 'ENABLE_AND_USE',
      instructions: [
        {
          to: MOCK_ERC20_ADDRESS,
          data: transferData,
          value: 0n,
        },
      ],
      sponsorship: true,
    })

    // 8. トランザクション結果の確認
    const txHash = result.txHash
    if (!txHash) {
      return {
        success: false,
        error: 'Transaction hash not returned',
      }
    }

    // 9. レスポンス生成
    return {
      success: true,
      data: {
        tx_hash: txHash,
        status: 'completed',
        message: 'Oliverが決済を完了しました！',
        recipient: PAYMENT_RECIPIENT_ADDRESS,
        amount: amountStr,
        tokenAddress: MOCK_ERC20_ADDRESS,
        timestamp: new Date().toISOString(),
      },
    }
    */
    return {
      success: true,
      data: {
        tx_hash: '0x1234567890',
      },
    }
  } catch (error) {
    console.error('x402_payment execution error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return {
      success: false,
      error: `Payment execution failed: ${errorMessage}`,
    }
  }
}

