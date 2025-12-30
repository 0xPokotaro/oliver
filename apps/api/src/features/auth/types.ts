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

export interface PrivyJWTPayload {
  sub: string // privy_user_id
  iat?: number
  exp?: number
}

export interface SessionPayload {
  userId: string
  privyUserId: string
  walletAddress: string
}
