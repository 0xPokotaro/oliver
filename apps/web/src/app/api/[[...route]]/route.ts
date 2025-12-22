import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import healthRoutes from './merchant/health'
import productsRoutes from './merchant/products'
import ordersRoutes from './merchant/orders'

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello Next.js!',
  })
})

// Merchant APIルートをマウント
app.route('/merchant', healthRoutes)
app.route('/merchant', productsRoutes)
app.route('/merchant', ordersRoutes)

export const GET = handle(app)
export const POST = handle(app)
