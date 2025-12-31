import { Hono } from 'hono'
import * as userService from '../services/user.service'
import { userListResponse } from '@oliver/shared/schemas/user.schema'
import { z } from 'zod'

const app = new Hono()
  .get('/', async (c) => {
    const users = await userService.getAllUsers()
    const result = z.array(userListResponse).parse(users)

    return c.json(result)
  })

export default app
