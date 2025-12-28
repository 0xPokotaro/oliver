import { Context } from 'hono'

/**
 * エラーレスポンス生成ヘルパー関数
 */
export function createErrorResponse(
  c: Context,
  statusCode: number,
  errorMessage: string,
  errorCode?: string
) {
  return c.json(
    {
      error: errorMessage,
      ...(errorCode && { code: errorCode }),
    },
    statusCode as any
  )
}

