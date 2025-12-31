/**
 * カスタムエラー型定義
 * API通信時のエラーを統一的に扱うためのエラークラス
 */

/**
 * API通信エラーの基底クラス
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 認証エラー（401）
 */
export class AuthenticationError extends ApiError {
  constructor(message: string) {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * ユーザー未登録エラー（401 + USER_NOT_FOUND）
 * 自動ログイン処理のトリガーとして使用
 */
export class UserNotFoundError extends ApiError {
  constructor(message: string = 'User not found') {
    super(message, 401, 'USER_NOT_FOUND');
    this.name = 'UserNotFoundError';
  }
}
