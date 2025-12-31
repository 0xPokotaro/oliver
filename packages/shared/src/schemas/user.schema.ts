import { z } from 'zod'

export const userListRequest = z.object({
  id: z.number(),
  name: z.string(),
})

export const userListResponse = z.object({
  id: z.number(),
  name: z.string(),
})
