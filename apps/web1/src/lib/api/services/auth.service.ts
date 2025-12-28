import type { PrismaClient } from "@oliver/database";
import { verifyDynamicJwt } from "../lib/dynamic-jwt";
import { generateSessionToken } from "../lib/session";
import { upsertUser } from "../lib/user-repository";

export interface LoginResult {
  userId: string;
  walletAddress: string;
  sessionToken: string;
}

export const authService = {
  /**
   * ログイン処理
   * 1. Dynamic JWTを検証
   * 2. ユーザー情報をDBにUpsert
   * 3. セッショントークンを生成
   */
  async login(
    prisma: PrismaClient,
    authToken: string,
    dynamicEnvId: string,
    sessionSecret: string
  ): Promise<LoginResult> {
    // 1. Dynamic JWTを検証してユーザー情報を取得
    const verificationResult = await verifyDynamicJwt(authToken, dynamicEnvId);

    // 2. データベースにUpsert
    const user = await upsertUser(
      prisma,
      verificationResult.dynamicUserId,
      verificationResult.walletAddress
    );

    // 3. セッショントークンを生成
    const sessionToken = await generateSessionToken(user.id, sessionSecret);

    return {
      userId: user.id,
      walletAddress: user.walletAddress,
      sessionToken,
    };
  },

  /**
   * ログアウト処理
   * セッション無効化はCookie削除で行うため、サーバー側では特に処理なし
   */
  async logout(): Promise<void> {
    // セッション無効化はCookie削除で行うため、特に処理なし
    return;
  },
};

