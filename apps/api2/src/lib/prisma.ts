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
    // 環境変数のデバッグログ
    console.log("=".repeat(50));
    console.log("Prisma Client Initialization - Environment Variables");
    console.log("=".repeat(50));
    console.log("PORT:", process.env.PORT);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("DATABASE_URL is set:", !!process.env.DATABASE_URL);
    console.log("DATABASE_URL length:", process.env.DATABASE_URL?.length || 0);
    // セキュリティのため、DATABASE_URLの最初の部分のみ表示（postgresql://...@host:port/dbname）
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      console.log("DATABASE_URL preview:", `${url.protocol}//${url.hostname}:${url.port}${url.pathname}`);
    }

    // 環境変数DATABASE_URLを明示的に読み込む
    let connectionString =
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

    // Cloud Runで動作している場合（PORT環境変数が設定されている）は常にSSLを有効化
    // または、NODE_ENVがproductionの場合もSSLを有効化
    const isProduction =
      process.env.PORT !== undefined || process.env.NODE_ENV === "production";

    // 本番環境の場合、接続文字列にsslmodeパラメータを追加（既に含まれていない場合）
    if (isProduction && !connectionString.includes("sslmode=")) {
      const separator = connectionString.includes("?") ? "&" : "?";
      connectionString = `${connectionString}${separator}sslmode=require`;
      console.log("Added sslmode=require to connection string");
    }

    console.log("isProduction:", isProduction);
    console.log("SSL will be:", isProduction ? "enabled (rejectUnauthorized: false)" : "disabled");
    console.log("=".repeat(50));

    // SSL設定を追加（本番環境では必須）
    // PrismaPgはPoolインスタンスまたはconnectionStringオブジェクトを受け取れる
    const pool = new Pool({
      connectionString,
      // 本番環境ではSSLを有効化
      // rejectUnauthorized: false は自己署名証明書を使用する場合に必要
      // pg v8では、sslオブジェクトを明示的に設定する必要がある
      ssl: isProduction
        ? {
            rejectUnauthorized: false,
            // 追加のSSL設定
            require: true,
          }
        : undefined, // 開発環境ではSSLを無効化
    });

    // PrismaPgアダプターを使用してPrismaClientを初期化
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
}
