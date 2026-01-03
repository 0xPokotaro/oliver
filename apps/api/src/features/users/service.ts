import { UserRepository } from '@oliver/api/domain/repositories/user.repository'
import { SessionKeyRepository } from '@oliver/api/domain/repositories/session-key.repository'
import { generateWalletKeyPair } from '@oliver/api/shared/utils/wallet'
import { encrypt } from '@oliver/api/shared/utils/encryption'
import { getPrismaClient } from '@oliver/api/infrastructure/dependencies'
import OpenAI from 'openai'

export interface CreateSmartAccountResponse {
  id: string
  privyUserId: string
  walletAddress: string
  smartAccountAddress: string
}

export const createSmartAccount = async (
  userId: string,
  userRepository: UserRepository,
  sessionKeyRepository: SessionKeyRepository
): Promise<CreateSmartAccountResponse> => {
  // 1. 秘密鍵を生成
  const { privateKey, address } = generateWalletKeyPair()

  // 2. 秘密鍵を暗号化
  const { iv, content } = encrypt(privateKey)

  // 3. SessionKeyテーブルに保存
  await sessionKeyRepository.create({
    userId,
    encryptedPrivateKeyIv: iv,
    encryptedPrivateKeyContent: content,
    sessionKeyAddress: address,
  })

  // 4. UserテーブルのsmartAccountAddressを更新
  const user = await userRepository.updateSmartAccountAddress(userId, address)

  // 5. Walletを取得
  let walletAddress: string = ''
  if (user.walletId) {
    const prisma = getPrismaClient()
    const wallet = await prisma.wallet.findUnique({
      where: { id: user.walletId },
    })
    walletAddress = wallet?.address ?? ''
  }

  // 6. レスポンス形式を返却
  return {
    id: user.id,
    privyUserId: user.privyUserId,
    walletAddress,
    smartAccountAddress: address,
  }
}

/**
 * 音声ファイルをテキストに変換する
 * OpenAI Whisper APIを使用して音声解析を行う
 * @param audioFile - 音声ファイル（Fileオブジェクト）
 * @returns 解析されたテキスト
 * @throws Error - OpenAI API呼び出し失敗時
 */
export async function transcribeAudio(audioFile: File): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  const openai = new OpenAI({
    apiKey: apiKey,
  })

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ja',
    })

    return transcription.text
  } catch (error) {
    console.error('OpenAI Whisper API error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to transcribe audio: ${error.message}`)
    }
    throw new Error('Failed to transcribe audio: Unknown error')
  }
}
