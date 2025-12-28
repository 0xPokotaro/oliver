import { hc } from 'hono/client'
import type { AppType } from '@oliver/api'

export const client = hc<AppType>('/')
