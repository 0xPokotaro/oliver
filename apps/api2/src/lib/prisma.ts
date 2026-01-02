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

    // 接続文字列の正規化: postgres:// を postgresql:// に変換
    connectionString = connectionString.replace(/^postgres:\/\//, "postgresql://");

    // Supabase の接続文字列を検出
    const isSupabase = connectionString.includes("supabase.com");
    
    // Cloud Runで動作している場合（PORT環境変数が設定されている）は常にSSLを有効化
    // または、NODE_ENVがproductionの場合、またはSupabase接続の場合もSSLを有効化
    const isProduction =
      process.env.PORT !== undefined || 
      process.env.NODE_ENV === "production" || 
      isSupabase;

    // 接続文字列から sslmode パラメータを削除（Pool の設定を優先）
    if (connectionString.includes("sslmode=")) {
      connectionString = connectionString.replace(/[?&]sslmode=[^&]*/, "");
      // クエリパラメータが空になった場合は ? を削除
      connectionString = connectionString.replace(/\?$/, "");
      console.log("Removed sslmode parameter from connection string (using Pool SSL config instead)");
    }

    console.log("isProduction:", isProduction);
    console.log("isSupabase:", isSupabase);
    console.log("Final connection string (masked):", connectionString.replace(/:[^:@]+@/, ":****@"));
    console.log("SSL will be:", isProduction || isSupabase ? "enabled (rejectUnauthorized: false)" : "disabled");
    console.log("=".repeat(50));

    // SSL設定を追加（本番環境では必須）
    // PrismaPgはPoolインスタンスまたはconnectionStringオブジェクトを受け取れる
    const poolConfig: {
      connectionString: string;
      ssl?: boolean | { rejectUnauthorized: boolean };
    } = {
      connectionString,
    };

    // 本番環境またはSupabase接続ではSSLを有効化
    // rejectUnauthorized: false は自己署名証明書を使用する場合に必要
    // Supabaseの公式ドキュメントでは、rejectUnauthorized: false の使用が推奨されています
    if (isProduction || isSupabase) {
      poolConfig.ssl = {
        rejectUnauthorized: false,
      };
      console.log("Pool SSL config:", JSON.stringify(poolConfig.ssl));
    }

    const pool = new Pool(poolConfig);

    // PrismaPgアダプターを使用してPrismaClientを初期化
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
    
    console.log("PrismaClient initialized with adapter");
  }
  return prismaInstance;
}
