import { Context } from 'hono'
import type { Env } from '@oliver/api/infrastructure/types'

export const getProfilHandlere = async (c: Context<Env>) => {
  // ミドルウェアで検証済みのJWTペイロードを取得
  const jwtPayload = c.get('jwtPayload')

  return c.json({ message: 'Get profile', payload: jwtPayload })
}
