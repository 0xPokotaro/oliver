import type { ErrorHandler } from "hono";
import type { Env } from "../../types";
import { z } from "zod";
import { AppError } from "./classes";

/**
 * HonoのonErrorハンドラーを作成
 * service層でthrowされたエラーを適切なHTTPレスポンスに変換する
 */
export function createErrorHandler(): ErrorHandler<Env> {
  return (error, c) => {
    console.error("Error:", error);

    // AppErrorの場合
    if (error instanceof AppError) {
      return c.json(
        {
          error: error.message,
          code: error.code,
          message: error.message,
        },
        error.statusCode as 200 | 201 | 400 | 401 | 403 | 404 | 500,
      );
    }

    // Zodのバリデーションエラーの場合
    if (error instanceof z.ZodError) {
      return c.json(
        {
          error: "Validation error",
          code: "VALIDATION_ERROR",
          message: error.issues.map((issue) => issue.message).join(", "),
        },
        400,
      );
    }

    // その他のエラー
    return c.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  };
}
