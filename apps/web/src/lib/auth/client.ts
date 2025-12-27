/**
 * Authentication API client
 */

import type { LoginRequest, LoginResponse } from "@/lib/types/auth-types";

// Next.jsのAPIルート経由でアクセス（プロキシ経由）
const API_BASE_URL = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Login with Dynamic JWT token
 * @param authToken - JWT token from Dynamic
 * @returns Login response with user ID and wallet address
 */
export async function login(authToken: string): Promise<LoginResponse> {
  try {
    // ブラウザからはNext.jsのAPIルート経由でアクセス
    const requestUrl = typeof window !== "undefined" 
      ? "/api/auth/login"
      : `${API_BASE_URL}/api/auth/login`;
    const requestBody = JSON.stringify({ authToken } as LoginRequest);
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in request
      body: requestBody,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Unknown error",
        code: "UNKNOWN_ERROR",
      }));
      throw new Error(errorData.error || `Login failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Login error:", error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("Login failed");
  }
}
