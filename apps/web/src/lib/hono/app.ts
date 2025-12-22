import { Hono } from 'hono'
import products from './routes/products'

export const app = new Hono()
  .basePath('/api')
  .route('/products', products)

export type AppType = typeof app
