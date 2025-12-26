import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@oliver/database";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || "";
  
  // ビルド時には環境変数がなくてもエラーにしない
  // ダミーのconnectionStringを使用してadapterを作成
  const dbUrl = connectionString || "postgresql://user:password@localhost:5432/db";
  const adapter = new PrismaPg({ connectionString: dbUrl });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

export { prisma };
