/**
 * アプリケーション全体で使用するカスタムエラークラス
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found エラー
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", code: string = "NOT_FOUND") {
    super(404, code, message);
  }
}

/**
 * 401 Unauthorized エラー
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", code: string = "UNAUTHORIZED") {
    super(401, code, message);
  }
}

/**
 * 400 Bad Request エラー
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", code: string = "BAD_REQUEST") {
    super(400, code, message);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error", code: string = "INTERNAL_ERROR") {
    super(500, code, message);
  }
}

