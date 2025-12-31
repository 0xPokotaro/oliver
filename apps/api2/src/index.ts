import { Hono } from 'hono'

const app = new Hono()
  .get('/', (c) => c.json({ message: 'Hello, World!' }))
  .get('/hello', (c) => c.json({ message: 'Hello, World!' }))

// サーバー起動コード（開発環境用）
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT) || 3001
  const { serve } = await import('@hono/node-server')
  serve({ fetch: app.fetch, port }, (info: { address: string; port: number }) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  })
}

export default app
