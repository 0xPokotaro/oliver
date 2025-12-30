import { MiddlewareHandler } from 'hono'
import { createAuthService, createUserRepository } from './dependencies'
import type { Env } from './types'
import { handleAuthError } from '@oliver/api/shared/errors/authErrorHandler'

export const injectDependencies: MiddlewareHandler<Env> = async (c, next) => {
  // Contextに依存性を注入
  c.set('authService', createAuthService())
  await next()
}

export const requireAuthMiddleware: MiddlewareHandler<Env> = async (c, next) => {
  try {
    // Authorizationヘッダーからアクセストークンを取得
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header is missing')
    }

    // Bearerプレフィックスを除去
    const authToken = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader

    // Privyトークンを検証
    const authService = c.get('authService')
    const payload = await authService.verifyPrivyToken(authToken)

    // Contextに検証済みペイロードをset
    c.set('jwtPayload', payload)

    // ペイロードからprivyUserIdを取得
    const privyUserId = payload.sub

    // DBからユーザー情報を取得
    const userRepository = createUserRepository()
    let user = await userRepository.findByPrivyUserId(privyUserId)

    if (user === null) {
      // 新規ユーザーの場合、エラーを返す
      // フロントエンドはログインエンドポイントを呼び出す必要がある
      throw new Error('USER_NOT_FOUND: User not found. Please login first.')
    }

    // Contextにユーザー情報をset
    c.set('user', user)

    await next()
  } catch (error) {
    return handleAuthError(c, error)
  }
}
