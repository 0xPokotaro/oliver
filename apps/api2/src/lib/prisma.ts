import { PrismaClient } from "@oliver/database/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// PrismaClientのシングルトンインスタンス
let prismaInstance: PrismaClient | null = null;

/**
 * PrismaClientのシングルトンインスタンスを取得
 */
export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    // 環境変数DATABASE_URLを明示的に読み込む
    const connectionString =
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

    // SSL設定を追加（本番環境では必須）
    // PrismaPgはPoolインスタンスまたはconnectionStringオブジェクトを受け取れる
    const pool = new Pool({
      connectionString,
      // 本番環境ではSSLを有効化
      // rejectUnauthorized: false は自己署名証明書を使用する場合に必要
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : undefined, // 開発環境ではSSLを無効化
    });

    // PrismaPgアダプターを使用してPrismaClientを初期化
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
}
