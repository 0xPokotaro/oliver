import { PrivyClient } from "@privy-io/node";
import { getPrivyConfig } from "../config";

let privyInstance: PrivyClient | null = null;

export function getPrivyClient(): PrivyClient {
  if (!privyInstance) {
    const privyConfig = getPrivyConfig();
    privyInstance = new PrivyClient({
      appId: privyConfig.appId,
      appSecret: privyConfig.appSecret,
    });
  }
  return privyInstance;
}
