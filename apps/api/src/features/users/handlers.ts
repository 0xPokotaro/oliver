import { Context } from 'hono'
import type { Env } from '@oliver/api/infrastructure/types'
import { createSmartAccount } from '@oliver/api/features/users/service'
import { createUserRepository, createSessionKeyRepository } from '@oliver/api/infrastructure/dependencies'
import { generateWalletKeyPair } from '@oliver/api/shared/utils/wallet'
import { encrypt } from '@oliver/api/shared/utils/encryption'
import { createSmartAccountRequestSchema } from '@oliver/api/features/users/schemas'
import type { z } from 'zod'
import { toSmartSessionsModule, toMultichainNexusAccount, getMEEVersion, MEEVersion, createMeeClient, meeSessionActions } from '@biconomy/abstractjs'
import { privateKeyToAccount } from 'viem/accounts'
import { avalanche } from 'viem/chains'
import { http, createWalletClient } from 'viem'

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
