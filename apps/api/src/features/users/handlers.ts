import { Context } from 'hono'
import type { Env } from '@oliver/api/infrastructure/types'
import { createSmartAccount, transcribeAudio } from '@oliver/api/features/users/service'
import { createUserRepository, createSessionKeyRepository } from '@oliver/api/infrastructure/dependencies'
import { generateWalletKeyPair } from '@oliver/api/shared/utils/wallet'
import { encrypt } from '@oliver/api/shared/utils/encryption'
import { createSmartAccountRequestSchema } from '@oliver/api/features/users/schemas'
import type { z } from 'zod'
import { toSmartSessionsModule, toMultichainNexusAccount, getMEEVersion, MEEVersion, createMeeClient, meeSessionActions } from '@biconomy/abstractjs'
import { privateKeyToAccount } from 'viem/accounts'
import { avalanche } from 'viem/chains'
import { http, createWalletClient } from 'viem'
import { ERROR_CODES, ERROR_MESSAGES } from '@oliver/api/shared/errors/constants'

export const getProfilHandlere = async (c: Context<Env>) => {
  // ミドルウェアで取得済みのユーザー情報を取得
  const user = c.get('user')

  return c.json({
    id: user.id,
    privyUserId: user.privyUserId,
    walletAddress: user.walletAddress,
    smartAccountAddress: user.smartAccountAddress,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  })
}

export const voiceHandler = async (c: Context<Env>) => {
  const user = c.get('user')

  try {
    const body = await c.req.parseBody()
    const audioFile = body.audio

    // ファイルが存在するかチェック
    if (!audioFile) {
      return c.json(
        {
          success: false,
          error: 'Audio file is required',
          code: 'INVALID_AUDIO_FORMAT',
        },
        400
      )
    }

    // ファイルがFileオブジェクトかチェック
    if (!(audioFile instanceof File)) {
      return c.json(
        {
          success: false,
          error: ERROR_MESSAGES.INVALID_AUDIO_FORMAT,
          code: ERROR_CODES.INVALID_AUDIO_FORMAT,
        },
        400
      )
    }

    // WAV形式かチェック（MIMEタイプまたはファイル拡張子）
    const contentType = audioFile.type
    const fileName = audioFile.name.toLowerCase()

    const isWav =
      contentType === 'audio/wav' ||
      contentType === 'audio/x-wav' ||
      contentType === 'audio/wave' ||
      fileName.endsWith('.wav')

    if (!isWav) {
      return c.json(
        {
          success: false,
          error: ERROR_MESSAGES.INVALID_AUDIO_FORMAT,
          code: ERROR_CODES.INVALID_AUDIO_FORMAT,
        },
        400
      )
    }

    // 音声ファイルをテキストに変換
    const text = await transcribeAudio(audioFile)

    console.log(`Voice file transcribed for user ${user.id}:`, {
      fileName: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
      textLength: text.length,
    })

    return c.json({
      success: true,
      text: text,
    })
  } catch (error) {
    console.error('Voice handler error:', error)
    
    // エラーメッセージを取得
    const errorMessage = error instanceof Error ? error.message : 'Failed to process voice command'
    
    // OpenAI API関連のエラーの場合は詳細を返す
    if (errorMessage.includes('OPENAI_API_KEY')) {
      return c.json(
        {
          success: false,
          error: 'OpenAI API key is not configured',
          code: 'OPENAI_API_KEY_MISSING',
        },
        500
      )
    }
    
    return c.json(
      {
        success: false,
        error: errorMessage,
        code: 'INTERNAL_ERROR',
      },
      500
    )
  }
}

export const createSmartAccountHandler = async (c: Context<Env>) => {
  const user = c.get('user')
  console.log("user: ", user)

  // @ts-ignore
  const body = await c.req.valid('json') as z.infer<typeof createSmartAccountRequestSchema>
  console.log("body: ", body)

  const walletClient = createWalletClient({
    account: user.walletAddress as `0x${string}`,
    chain: avalanche,
    transport: http(),
  })

  const { privateKey, address } = generateWalletKeyPair()
  console.log("privateKey: ", privateKey)

  // 秘密鍵を暗号化
  const { iv, content } = encrypt(privateKey)

  // SessionKeyをDBに登録
  const sessionKeyRepository = createSessionKeyRepository()
  await sessionKeyRepository.create({
    userId: user.id,
    encryptedPrivateKeyIv: iv,
    encryptedPrivateKeyContent: content,
    sessionKeyAddress: address,
  })

  const sessionSigner = privateKeyToAccount(privateKey as `0x${string}`)

  const ssValidator = toSmartSessionsModule({
    signer: sessionSigner
  })

  const orchestrator = await toMultichainNexusAccount({
    chainConfigurations: [
      {
        chain: avalanche,
        transport: http(), // 必要ならRPC指定
        version: getMEEVersion(MEEVersion.V2_2_1),
        accountAddress: user.walletAddress as `0x${string}`,
      },
    ],
    signer: walletClient,
  });

  const meeClient = await createMeeClient({
    account: orchestrator,
    apiKey: process.env.BICONOMY_API_KEY,
  })

  const sessionsMeeClient = meeClient.extend(meeSessionActions)
  console.log("sessionsMeeClient: ", sessionsMeeClient)

  /*
  const userRepository = createUserRepository()
  const sessionKeyRepository = createSessionKeyRepository()
  
  const response = await createSmartAccount(user.id, userRepository, sessionKeyRepository)
  
  return c.json(response)
  */
 return c.json({ message: "Smart account created" })
}
