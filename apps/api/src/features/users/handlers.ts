import { Context } from 'hono'

export const listUsers = async (c: Context) => {
  return c.json({ message: 'List users' })
}
