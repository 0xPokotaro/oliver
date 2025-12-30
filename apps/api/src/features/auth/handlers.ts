import { Context } from 'hono'
import { handleAuthError } from '@oliver/api/shared/errors/authErrorHandler'
import { setSessionCookie } from '@oliver/api/shared/utils/cookie'
import type { Env } from '@oliver/api/infrastructure/types'

export const loginHandler = async (c: Context<Env>) => {
  try {
    const { authToken, walletAddress } = await c.req.json()

    // 認証サービスでログイン処理を実行
    const authService = c.get('authService')
    const { response, sessionToken } = await authService.login(authToken, walletAddress)

    // セッションCookieを設定（7日間有効）
    setSessionCookie(c, sessionToken, 604800)

    // レスポンスを返す
    return c.json(response, 200)
  } catch (error) {
    return handleAuthError(c, error)
  }
}

export const logoutHandler = async (c: Context<Env>) => {
  try {
    const authService = c.get('authService')
    const response = await authService.logout()

    // セッションCookieを削除（Max-Age=0に設定）
    setSessionCookie(c, '', 0)

    return c.json(response, 200)
  } catch (error) {
    return handleAuthError(c, error)
  }
}
