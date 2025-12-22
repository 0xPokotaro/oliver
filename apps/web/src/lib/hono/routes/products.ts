import { Hono } from 'hono'
import { getProducts } from '@/lib/merchant/client'

const products = new Hono()
  .get('/', async (c) => {
    const category = c.req.query('category')
    
    try {
      const products = await getProducts(category)
      return c.json(products)
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 500)
      }
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

export default products

