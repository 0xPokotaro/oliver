import { Hono } from "hono";
import * as userService from "../services/user.service";
import {
  userListResponse,
  userProfileResponse,
} from "@oliver/shared/schemas/api";
import { z } from "zod";
import type { Env } from "../types";

const app = new Hono<Env>()
  .get("/", async (c) => {
    const users = await userService.getAllUsers();
    const result = z.array(userListResponse).parse(users);

    return c.json(result);
  })
  .get("/profile", async (c) => {
    const user = c.get("user");

    const profile = await userService.getUserProfile(user.id);
    const result = userProfileResponse.parse(profile);
    return c.json(result);
  })
  .post("/smart-account", async (c) => {
    const user = c.get("user");

    const result = await userService.createSmartAccount(user.id);
    return c.json(result);
  });

export default app;
