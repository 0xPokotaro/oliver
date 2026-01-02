export interface AppConfig {
  openaiApiKey: string;
  merchantAddress: string;
  facilitatorBaseURL: string;
  defaultCurrency: string;
}

export interface DatabaseConfig {
  connectionString: string;
  isProduction: boolean;
  isSupabase: boolean;
}

export function getDatabaseConfig(): DatabaseConfig {
  let connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

  connectionString = connectionString.replace(/^postgres:\/\//, "postgresql://");
  const isSupabase = connectionString.includes("supabase.com");
  const isProduction =
    process.env.PORT !== undefined ||
    process.env.NODE_ENV === "production" ||
    isSupabase;

  return {
    connectionString,
    isProduction,
    isSupabase,
  };
}

export function getAppConfig(): AppConfig {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const merchantAddress = process.env.MERCHANT_ADDRESS;
  if (!merchantAddress) {
    throw new Error("MERCHANT_ADDRESS environment variable is not set");
  }

  const facilitatorBaseURL = process.env.FACILITATOR_BASE_URL;
  if (!facilitatorBaseURL) {
    throw new Error("FACILITATOR_BASE_URL environment variable is not set");
  }

  const defaultCurrency =
    process.env.DEFAULT_CURRENCY ||
    "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";

  return {
    openaiApiKey,
    merchantAddress,
    facilitatorBaseURL,
    defaultCurrency,
  };
}
