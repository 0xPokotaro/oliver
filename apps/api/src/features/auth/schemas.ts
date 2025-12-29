import { z } from 'zod'

export const loginRequestSchema = z.object({
  authToken: z.string().min(1, 'authToken is required'),
})

export const loginResponseSchema = z.object({
  userId: z.string().uuid(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format'),
  smartAccountAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid smart account address format'),
})

export const logoutResponseSchema = z.object({
  message: z.string(),
})

export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
})
