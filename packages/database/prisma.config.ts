import "dotenv/config";

export default {
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  },
  migrations: {
    seed: "tsx src/prisma/seed.ts",
  },
};
