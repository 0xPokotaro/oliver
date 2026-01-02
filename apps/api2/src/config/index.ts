/**
 * アプリケーション設定
 */
export interface AppConfig {
  openaiApiKey: string;
  merchantAddress: string;
  facilitatorBaseURL: string;
  defaultCurrency: string;
}

/**
 * 環境変数からアプリケーション設定を取得
 */
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

  // デフォルト通貨アドレス（Avalanche C-Chain USDC）
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
