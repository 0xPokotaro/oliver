import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { loginRequestSchema } from '@oliver/api/features/auth/schemas'
import { loginHandler, logoutHandler } from '@oliver/api/features/auth/handlers'
import type { Env } from '@oliver/api/infrastructure/types'

export const authRoutes = new Hono<Env>()
  .post('/login', zValidator('json', loginRequestSchema), loginHandler)
  .post('/logout', logoutHandler)
