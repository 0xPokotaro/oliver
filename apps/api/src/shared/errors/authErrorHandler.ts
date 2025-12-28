import { Context } from 'hono'
import { ERROR_CODES, ERROR_MESSAGES } from './constants'
import { createErrorResponse } from './response'

/**
 * 認証エラーハンドリングのヘルパー関数
 */
export function handleAuthError(c: Context, error: unknown) {
  if (!(error instanceof Error)) {
    return createErrorResponse(
      c,
      500,
      ERROR_MESSAGES.INTERNAL_ERROR,
      ERROR_CODES.INTERNAL_ERROR
    )
  }

  // エラーメッセージに基づいて適切なレスポンスを返す
  if (error.message.includes('Invalid or expired JWT token')) {
    return createErrorResponse(
      c,
      401,
      ERROR_MESSAGES.INVALID_TOKEN,
      ERROR_CODES.INVALID_TOKEN
    )
  }

  if (error.message.includes('No wallet address found')) {
    return createErrorResponse(
      c,
      401,
      ERROR_MESSAGES.NO_WALLET_ADDRESS,
      ERROR_CODES.INVALID_TOKEN
    )
  }

  // その他のエラー
  console.error('Auth error:', error)
  return createErrorResponse(
    c,
    500,
    ERROR_MESSAGES.INTERNAL_ERROR,
    ERROR_CODES.INTERNAL_ERROR
  )
}

