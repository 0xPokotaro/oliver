import { z } from 'zod'

export const createSmartAccountRequestSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format'),
  chainId: z.number(),
  nonce: z.number(),
  r: z.string(),
  s: z.string(),
  yParity: z.number(),
})
