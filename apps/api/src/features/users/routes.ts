import { Hono } from 'hono'
import { getProfilHandlere } from '@oliver/api/features/users/handlers'
import { requireAuthMiddleware } from '@oliver/api/infrastructure/middleware'
import type { Env } from '@oliver/api/infrastructure/types'

export const userRoutes = new Hono<Env>()
  .use('*', requireAuthMiddleware)
  .get('/profile', getProfilHandlere)
