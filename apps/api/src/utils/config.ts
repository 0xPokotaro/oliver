import { getAppConfig } from "../config";

/**
 * セッション署名者の秘密鍵を取得
 * 環境変数から取得し、アプリケーション全体で共有されるSmartAccountの秘密鍵として使用
 */
export const getSessionSignerPrivateKey = (): `0x${string}` => {
  const appConfig = getAppConfig();
  const key = appConfig.paymentServerPrivateKey;

  if (!key) {
    throw new Error("Session signer private key not configured");
  }

  return key as `0x${string}`;
};
