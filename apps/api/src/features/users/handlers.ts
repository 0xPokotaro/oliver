import { Context } from 'hono'
import type { Env } from '@oliver/api/infrastructure/types'
import { createSmartAccount } from '@oliver/api/features/users/service'
import { createUserRepository, createSessionKeyRepository } from '@oliver/api/infrastructure/dependencies'

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
  const userRepository = createUserRepository()
  const sessionKeyRepository = createSessionKeyRepository()
  
  const response = await createSmartAccount(user.id, userRepository, sessionKeyRepository)
  
  return c.json(response)
}
