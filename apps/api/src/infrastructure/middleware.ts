import { MiddlewareHandler } from 'hono'
import { createAuthService } from './dependencies'
import type { Env } from './types'

export const injectDependencies: MiddlewareHandler<Env> = async (c, next) => {
  // Contextに依存性を注入
  c.set('authService', createAuthService())
  await next()
}
