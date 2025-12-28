/**
 * Authentication API types
 */

/**
 * Login request payload
 */
export interface LoginRequest {
  authToken: string; // JWT token from Dynamic
}

/**
 * Login response
 */
export interface LoginResponse {
  userId: string; // User ID (UUID format)
  walletAddress: string; // Wallet address (0x format)
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  error: string;
  code: string;
}
