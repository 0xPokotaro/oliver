import { PrismaClient } from "@oliver/database/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getDatabaseConfig } from "@oliver/api/config";

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    const dbConfig = getDatabaseConfig();
    let connectionString = dbConfig.connectionString;

    if (connectionString.includes("sslmode=")) {
      connectionString = connectionString.replace(/[?&]sslmode=[^&]*/, "");
      connectionString = connectionString.replace(/\?$/, "");
    }

    const poolConfig: {
      connectionString: string;
      ssl?: boolean | { rejectUnauthorized: boolean };
    } = {
      connectionString,
    };

    if (dbConfig.isProduction || dbConfig.isSupabase) {
      poolConfig.ssl = {
        rejectUnauthorized: false,
      };
    }

    const pool = new Pool(poolConfig);
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
}
