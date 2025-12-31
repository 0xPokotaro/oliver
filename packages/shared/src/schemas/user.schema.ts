import { z } from 'zod'

export const userListRequest = z.object({
  id: z.number(),
  name: z.string(),
})

export const userListResponse = z.object({
  id: z.string(),
  privyUserId: z.string(),
  walletAddress: z.string(),
  smartAccountAddress: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
