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
  if (error.message.includes('Invalid or expired')) {
    return createErrorResponse(
      c,
      401,
      ERROR_MESSAGES.INVALID_TOKEN,
      ERROR_CODES.INVALID_TOKEN
    )
  }

  if (error.message.includes('No wallet found for user') || error.message.includes('WALLET_NOT_FOUND')) {
    return createErrorResponse(
      c,
      400,
      ERROR_MESSAGES.WALLET_NOT_FOUND,
      ERROR_CODES.WALLET_NOT_FOUND
    )
  }

  if (error.message.includes('Failed to fetch wallet') || error.message.includes('WALLET_FETCH_FAILED')) {
    return createErrorResponse(
      c,
      400,
      ERROR_MESSAGES.WALLET_FETCH_FAILED,
      ERROR_CODES.WALLET_FETCH_FAILED
    )
  }

  if (error.message.includes('USER_NOT_FOUND') || error.message.includes('User not found')) {
    return createErrorResponse(
      c,
      401,
      ERROR_MESSAGES.USER_NOT_FOUND,
      ERROR_CODES.USER_NOT_FOUND
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

