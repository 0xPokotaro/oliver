import { Hono } from 'hono'
import { authRoutes } from '@oliver/api/features/auth/routes'
import { userRoutes } from '@oliver/api/features/users/routes'
import { errorHandler } from '@oliver/api/shared/middleware/errorHandler'
import { injectDependencies } from '@oliver/api/infrastructure/middleware'
import type { Env } from '@oliver/api/infrastructure/types'

const app = new Hono<Env>()
  .basePath('/api')
  .use('*', injectDependencies)
  .route('/auth', authRoutes)
  .route('/users', userRoutes)
  .onError(errorHandler)

export type AppType = typeof app;
export default app;
