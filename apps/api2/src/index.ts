import { cors } from 'hono/cors'
import { createFactory } from 'hono/factory'
import { logger } from 'hono/logger'
import users from './routes/users'

type Env = {
  Variables: {
    myVar: string
  }
}

const factory = createFactory<Env>()

const middleware = factory.createMiddleware(async (c, next) => {
  c.set('myVar', 'bar')
  await next()
})

const app = factory.createApp()
  .basePath('/api')
  .use(logger())
  .use('*', cors())
  .use(middleware)
  .route('/users', users)

// サーバー起動コード（開発環境用）
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT) || 3001
  const { serve } = await import('@hono/node-server')
  serve({ fetch: app.fetch, port }, (info: { address: string; port: number }) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  })
}

export default app
export type AppType = typeof app
