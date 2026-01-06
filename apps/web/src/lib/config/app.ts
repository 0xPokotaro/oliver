import { Store } from "lucide-react";

// グローバル定数の定義
export const APP_DATA = {
  name: "Oliver",
  logo: Store,
  description: "AI-Commerce",
} as const;

/**
 * バックエンドAPIのURLを環境変数から取得
 * @returns バックエンドAPIのURL（未設定の場合は "/" を返す）
 */
export const getBackendApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_BACKEND_API_URL || "/";
};

/**
 * Privyの設定を環境変数から取得
 */
export const getPrivyAppId = (): string => {
  return process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
};

export const getPrivyClientId = (): string => {
  return process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || "";
};

