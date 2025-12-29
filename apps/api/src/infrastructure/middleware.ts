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
    // AuthorizationヘッダーからJWTを取得
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header is missing')
    }

    // Bearerプレフィックスを除去
    const authToken = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader

    // JWTを検証
    const authService = c.get('authService')
    const payload = await authService.verifyDynamicJWT(authToken)

    // Contextに検証済みペイロードをset
    c.set('jwtPayload', payload)

    // ペイロードからdynamicUserIdを取得
    const dynamicUserId = payload.sub

    // DBからユーザー情報を取得
    const userRepository = createUserRepository()
    const user = await userRepository.findByDynamicUserId(dynamicUserId)

    if (!user) {
      throw new Error('User not found')
    }

    // Contextにユーザー情報をset
    c.set('user', user)

    await next()
  } catch (error) {
    return handleAuthError(c, error)
  }
}
