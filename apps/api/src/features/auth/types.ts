import { z } from 'zod'
import {
  loginRequestSchema,
  loginResponseSchema,
  logoutResponseSchema,
  errorResponseSchema,
} from './schemas'

export type LoginRequest = z.infer<typeof loginRequestSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
export type LogoutResponse = z.infer<typeof logoutResponseSchema>
export type ErrorResponse = z.infer<typeof errorResponseSchema>

export interface DynamicJWTPayload {
  sub: string // dynamic_user_id
  verified_credentials?: Array<{
    address: string
    chain: string
    format: string
    id: string
    public_key: string
    wallet_name: string
    wallet_provider: string
  }>
  iat?: number
  exp?: number
}

export interface SessionPayload {
  userId: string
  dynamicUserId: string
  walletAddress: string
}
