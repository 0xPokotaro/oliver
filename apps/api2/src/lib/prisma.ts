import { PrismaClient } from "@oliver/database/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

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

    // PrismaPgアダプターを使用してPrismaClientを初期化
    const adapter = new PrismaPg({ connectionString });
    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
}
