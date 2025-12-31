/**
 * エラーコード定数
 */
export const ERROR_CODES = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  WALLET_FETCH_FAILED: 'WALLET_FETCH_FAILED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_AUDIO_FORMAT: 'INVALID_AUDIO_FORMAT',
} as const

/**
 * エラーメッセージ定数
 */
export const ERROR_MESSAGES = {
  INVALID_TOKEN: 'Invalid or expired JWT token',
  INTERNAL_ERROR: 'Internal server error',
  WALLET_NOT_FOUND: 'No wallet found for user',
  WALLET_FETCH_FAILED: 'Failed to fetch wallet information from Privy',
  USER_NOT_FOUND: 'User not found. Please login first.',
  INVALID_AUDIO_FORMAT: 'Invalid audio format: only WAV is supported',
} as const

