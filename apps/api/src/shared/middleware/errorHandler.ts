import { Context, ErrorHandler } from 'hono'

export const errorHandler: ErrorHandler = (error: Error, c: Context) => {
  console.error('Error:', error)

  // エラーメッセージに基づいてステータスコードを決定
  if (error.message.includes('Invalid') || error.message.includes('expired')) {
    return c.json(
      {
        error: error.message,
        code: 'INVALID_TOKEN',
      },
      401
    )
  }

  // デフォルトは500エラー
  return c.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
    500
  )
}
