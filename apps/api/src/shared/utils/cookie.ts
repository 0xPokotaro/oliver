import { Context } from 'hono'
import type { Env } from '@oliver/api/infrastructure/types'

/**
 * セッションCookieを設定するヘルパー関数
 */
export function setSessionCookie(c: Context<Env>, token: string, maxAge: number) {
  const cookieValue = [
    `session=${token}`,
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${maxAge}`,
  ].join('; ')

  c.header('Set-Cookie', cookieValue)
}
