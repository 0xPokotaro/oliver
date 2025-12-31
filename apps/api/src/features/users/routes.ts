import { Hono } from 'hono'
import { getProfilHandlere, createSmartAccountHandler, voiceHandler } from '@oliver/api/features/users/handlers'
import { zValidator } from '@hono/zod-validator'
import { createSmartAccountRequestSchema } from '@oliver/api/features/users/schemas'
import { requireAuthMiddleware } from '@oliver/api/infrastructure/middleware'
import type { Env } from '@oliver/api/infrastructure/types'

export const userRoutes = new Hono<Env>()
  .use('*', requireAuthMiddleware)
  .get('/profile', getProfilHandlere)
  .post('/smart-account', zValidator('json', createSmartAccountRequestSchema), createSmartAccountHandler)
  .post('/voice', voiceHandler)
