import { Context, Next } from "hono";

export async function authGuard(c: Context, next: Next) {
  // TODO: Dynamic JWT検証・セッション検証
  // 検証成功時: c.set("userId", userId) などでコンテキストにユーザーIDを設定
  // 検証失敗時: return c.json({ error: "Unauthorized" }, 401);

  await next();
}

