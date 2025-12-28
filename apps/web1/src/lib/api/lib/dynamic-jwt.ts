// Dynamic JWT検証ユーティリティ

import { jwtVerify, createRemoteJWKSet } from "jose";
import { ERROR_CODES } from "./error-codes";

// Dynamic JWTペイロード型定義
interface VerifiedCredential {
  address?: string;
  [key: string]: unknown;
}

interface DynamicJwtPayload {
  sub: string; // dynamic_user_id
  verified_credentials?: VerifiedCredential[];
  scopes?: string[];
  [key: string]: unknown;
}

// JWT検証結果
export interface JwtVerificationResult {
  dynamicUserId: string;
  walletAddress: string;
}

// エラークラス
export class DynamicJwtError extends Error {
  constructor(
    message: string,
    public code: string = ERROR_CODES.INVALID_TOKEN
  ) {
    super(message);
    this.name = "DynamicJwtError";
  }
}

/**
 * Dynamic JWTトークンを検証し、ユーザー情報を抽出
 */
export async function verifyDynamicJwt(
  token: string,
  dynamicEnvId: string
): Promise<JwtVerificationResult> {
  console.log("Starting JWT verification for dynamic_env_id:", dynamicEnvId);

  try {
    // JWKSエンドポイントからリモートキーセットを作成
    const jwksUrl = `https://app.dynamic.xyz/api/v0/sdk/${dynamicEnvId}/.well-known/jwks`;
    console.log("Fetching JWKS from:", jwksUrl);

    const JWKS = createRemoteJWKSet(new URL(jwksUrl));

    // JWTを検証（audは検証しない - DynamicのJWTはフロントエンドのオリジンになるため）
    const { payload } = await jwtVerify<DynamicJwtPayload>(token, JWKS, {
      audience: undefined, // audを検証しない
    });

    console.log("JWT signature verified successfully");

    // MFAチェック
    if (payload.scopes?.includes("requiresAdditionalAuth")) {
      console.error("JWT requires additional authentication");
      throw new DynamicJwtError(
        "Additional verification required",
        ERROR_CODES.REQUIRES_ADDITIONAL_AUTH
      );
    }

    // wallet_addressを取得
    const walletAddress = extractWalletAddress(payload);
    console.log("Extracted wallet_address:", walletAddress);

    // dynamic_user_idを取得
    const dynamicUserId = payload.sub;
    console.log("Extracted dynamic_user_id:", dynamicUserId);

    console.log(
      "JWT verification completed successfully - dynamic_user_id:",
      dynamicUserId,
      "wallet_address:",
      walletAddress
    );

    return {
      dynamicUserId,
      walletAddress,
    };
  } catch (error) {
    if (error instanceof DynamicJwtError) {
      throw error;
    }
    console.error("Failed to verify JWT:", error);
    throw new DynamicJwtError(
      `Failed to verify JWT: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * ペイロードからウォレットアドレスを抽出
 */
function extractWalletAddress(payload: DynamicJwtPayload): string {
  if (payload.verified_credentials) {
    console.log(
      "Found",
      payload.verified_credentials.length,
      "verified credentials"
    );

    const firstCredential = payload.verified_credentials[0];
    if (firstCredential?.address) {
      console.log(
        "Extracted wallet address from verified_credentials:",
        firstCredential.address
      );
      return firstCredential.address;
    }
    console.warn("First verified credential does not have address field");
  } else {
    console.warn("Payload does not contain verified_credentials field");
  }

  console.error("Failed to extract wallet_address from JWT payload");
  throw new DynamicJwtError("INVALID_TOKEN");
}
