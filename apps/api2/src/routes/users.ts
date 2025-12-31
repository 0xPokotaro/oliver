import { Hono } from 'hono'
import { sValidator } from '@hono/standard-validator'
import * as userService from '../services/user.service'
import { userListRequest, userListResponse } from '@oliver/shared/schemas/user.schema'

const app = new Hono()
  .get('/', sValidator('param', userListRequest), async (c) => {
    const id = c.req.param('id')
    console.log(id)
    
    const users = await userService.getAllUsers()
    const result = userListResponse.parse(users)

    return c.json(result)
  })

export default app
