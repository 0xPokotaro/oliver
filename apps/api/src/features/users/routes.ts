import { Hono } from 'hono'
import * as handlers from '@oliver/api/features/users/handlers'

export const userRoutes = new Hono()
  .get('/list', handlers.listUsers)