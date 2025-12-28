// セッション管理ユーティリティ

import { SignJWT, jwtVerify } from "jose";
import { ERROR_CODES } from "./error-codes";

// セッションJWTペイロード
interface SessionClaims {
  sub: string; // user_id
  exp?: number; // 有効期限
  iat?: number; // 発行時刻
}

// セッションの有効期限（7日間）
const SESSION_DURATION_DAYS = 7;

/**
 * セッションJWTを生成
 */
export async function generateSessionToken(
  userId: string,
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + SESSION_DURATION_DAYS * 24 * 60 * 60; // 7日後

  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(exp)
    .setIssuedAt(now)
    .sign(new TextEncoder().encode(secret));

  return token;
}

/**
 * セッションJWTを検証してユーザーIDを取得
 */
export async function verifySessionToken(
  token: string,
  secret: string
): Promise<string> {
  try {
    const { payload } = await jwtVerify<SessionClaims>(
      token,
      new TextEncoder().encode(secret)
    );

    if (!payload.sub) {
      throw new Error("Invalid session token: missing sub claim");
    }

    return payload.sub;
  } catch (error) {
    console.error("Failed to verify session token:", error);
    throw new SessionError("Invalid session token", ERROR_CODES.INVALID_SESSION);
  }
}

// エラークラス
export class SessionError extends Error {
  constructor(
    message: string,
    public code: string = ERROR_CODES.INVALID_SESSION
  ) {
    super(message);
    this.name = "SessionError";
  }
}
