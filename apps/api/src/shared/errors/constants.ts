/**
 * エラーコード定数
 */
export const ERROR_CODES = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

/**
 * エラーメッセージ定数
 */
export const ERROR_MESSAGES = {
  INVALID_TOKEN: 'Invalid or expired JWT token',
  NO_WALLET_ADDRESS: 'No wallet address found in JWT',
  INTERNAL_ERROR: 'Internal server error',
} as const

