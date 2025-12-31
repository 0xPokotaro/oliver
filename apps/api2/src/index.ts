import { Hono } from 'hono'
import { logger } from 'hono/logger'
import users from './routes/users'

const app = new Hono()
  .basePath('/api')
  .use(logger())
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
