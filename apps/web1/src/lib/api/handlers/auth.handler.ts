import type { Context } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { authService } from "../services/auth.service";
import { ERROR_CODES } from "../lib/error-codes";
import { z } from "zod";
import type { PrismaClient } from "@oliver/database";

// リクエストボディのバリデーションスキーマ
const LoginRequestSchema = z.object({
  authToken: z.string().min(1, "authToken is required"),
});

export function createAuthHandler(
  prisma: PrismaClient,
  dynamicEnvId: string,
  sessionSecret: string
) {
  return {
    /**
     * POST /auth/login ハンドラー
     */
    async login(c: Context) {
      try {
        // 1. リクエストボディを取得・バリデーション
        const body = await c.req.json();
        const result = LoginRequestSchema.safeParse(body);

        if (!result.success) {
          return c.json(
            {
              error: "Validation error",
              code: ERROR_CODES.VALIDATION_ERROR,
              details: result.error.issues,
            },
            400
          );
        }

        const { authToken } = result.data;

        // 2. ログイン処理
        const loginResult = await authService.login(
          prisma,
          authToken,
          dynamicEnvId,
          sessionSecret
        );

        // 3. Cookieを設定
        setCookie(c, "session", loginResult.sessionToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7日間
        });

        // 4. レスポンスを返却
        return c.json({
          userId: loginResult.userId,
          walletAddress: loginResult.walletAddress,
        });
      } catch (error) {
        console.error("Login error:", error);

        // エラーレスポンスを返却
        if (error && typeof error === "object" && "code" in error) {
          return c.json(
            {
              error: error instanceof Error ? error.message : "Login failed",
              code: error.code,
            },
            401
          );
        }

        return c.json(
          {
            error: "Internal server error",
            code: "INTERNAL_ERROR",
          },
          500
        );
      }
    },

    /**
     * POST /auth/logout ハンドラー
     */
    async logout(c: Context) {
      try {
        // セッションCookieを削除
        deleteCookie(c, "session", {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          path: "/",
        });

        // 成功レスポンスを返却
        return c.json({
          message: "Logged out successfully",
        });
      } catch (error) {
        console.error("Logout error:", error);

        return c.json(
          {
            error: "Internal server error",
            code: "INTERNAL_ERROR",
          },
          500
        );
      }
    },
  };
}

