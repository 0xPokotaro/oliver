// 環境変数の取得と検証

export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

// API設定に必要な環境変数
export interface ApiEnv {
  DATABASE_URL: string;
  DYNAMIC_ENV_ID: string;
  SESSION_SECRET: string;
}

export function loadApiEnv(): ApiEnv {
  return {
    DATABASE_URL: getEnv("DATABASE_URL"),
    DYNAMIC_ENV_ID: getEnv("DYNAMIC_ENV_ID"),
    SESSION_SECRET: getEnv("SESSION_SECRET"),
  };
}
