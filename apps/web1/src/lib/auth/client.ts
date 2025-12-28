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
      // レスポンスのContent-Typeを確認
      const contentType = response.headers.get("content-type");
      let errorData: { error?: string; code?: string; details?: string };
      
      if (contentType && contentType.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = {
            error: `Login failed: ${response.status} ${response.statusText}`,
            code: "UNKNOWN_ERROR",
          };
        }
      } else {
        // JSON以外の場合はテキストとして読み取る（HTMLエラーページなど）
        const text = await response.text();
        errorData = {
          error: `Login failed: ${response.status} ${response.statusText}`,
          code: "UNKNOWN_ERROR",
          details: text.substring(0, 200), // 最初の200文字のみ
        };
      }
      
      const errorMessage = errorData.error || `Login failed: ${response.statusText}`;
      console.error("Login API error:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url: requestUrl,
      });
      
      throw new Error(errorMessage);
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

/**
 * Logout from the application
 * @returns Promise that resolves when logout is complete
 */
export async function logout(): Promise<void> {
  try {
    // ブラウザからはNext.jsのAPIルート経由でアクセス
    const requestUrl = typeof window !== "undefined" 
      ? "/api/auth/logout"
      : `${API_BASE_URL}/api/auth/logout`;
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in request
    });

    if (!response.ok) {
      // レスポンスのContent-Typeを確認
      const contentType = response.headers.get("content-type");
      let errorData: { error?: string; code?: string; details?: string };
      
      if (contentType && contentType.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = {
            error: `Logout failed: ${response.status} ${response.statusText}`,
            code: "UNKNOWN_ERROR",
          };
        }
      } else {
        // JSON以外の場合はテキストとして読み取る
        const text = await response.text();
        errorData = {
          error: `Logout failed: ${response.status} ${response.statusText}`,
          code: "UNKNOWN_ERROR",
          details: text.substring(0, 200),
        };
      }
      
      const errorMessage = errorData.error || `Logout failed: ${response.statusText}`;
      console.error("Logout API error:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url: requestUrl,
      });
      
      throw new Error(errorMessage);
    }

    // レスポンスは成功として扱う
    return;
  } catch (error) {
    console.error("Logout error:", error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("Logout failed");
  }
}
