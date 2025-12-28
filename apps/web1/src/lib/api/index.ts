import { Hono } from "hono";
import { PrismaClient } from "@oliver/database";
import { PrismaPg } from "@prisma/adapter-pg";
import { loadApiEnv } from "./lib/env";
import { createAuthRoutes } from "./routes/auth";
import usersRoutes from "./routes/users";

// PrismaClientのファクトリー関数
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || "";
  // ビルド時には環境変数がなくてもエラーにしない
  // ダミーのconnectionStringを使用してadapterを作成
  const dbUrl =
    connectionString || "postgresql://user:password@localhost:5432/db";
  const adapter = new PrismaPg({ connectionString: dbUrl });
  return new PrismaClient({ adapter });
}

// 環境変数を読み込み
let env: ReturnType<typeof loadApiEnv>;
let prisma: PrismaClient;
let authRoutes: ReturnType<typeof createAuthRoutes>;
let app: Hono;

// 初期化関数（環境変数が読み込まれるまで遅延実行）
function initialize() {
  try {
    env = loadApiEnv();
  } catch (error) {
    // 環境変数が設定されていない場合はデフォルト値を使用（開発時対応）
    env = {
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/db",
      DYNAMIC_ENV_ID: process.env.DYNAMIC_ENV_ID || "",
      SESSION_SECRET: process.env.SESSION_SECRET || "",
    };
  }

  prisma = createPrismaClient();
  authRoutes = createAuthRoutes(
    prisma,
    env.DYNAMIC_ENV_ID,
    env.SESSION_SECRET
  );
  
  // アプリケーションを作成
  app = new Hono()
    .route("/auth", authRoutes)
    .route("/users", usersRoutes);
}

// 初期化を実行
initialize();

export type AppType = typeof app;
export default app!;
export { prisma };

