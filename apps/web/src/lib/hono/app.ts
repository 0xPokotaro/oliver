import { Hono } from 'hono'
import products from './routes/products'
import users from './routes/users'

export const app = new Hono()
  .basePath('/api')
  .route('/products', products)
  .route('/users', users)

export type AppType = typeof app
