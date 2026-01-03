import { Store } from "lucide-react";

// グローバル定数の定義
export const TOKEN_ADDRESSES = {
  JPYC: "0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29",
  USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  MOCK_ERC20: "0x129D75c7D6217F07638f10F59325D268cC26162C",
} as const;

export const CONTRACT_ADDRESSES = {
  MEE: "0x0000000020fe2F30453074aD916eDeB653eC7E9D",
} as const;

export const BASE_SEPOLIA_TOKEN_ADDRESSES = {
  USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  JPYC: "0x47f47FfabA94759Ef08824B74beeE4dF34DF2415",
} as const;

export const APP_DATA = {
  name: "Oliver",
  logo: Store,
  description: "AI-Commerce",
} as const;
