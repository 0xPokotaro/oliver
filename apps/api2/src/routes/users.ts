import { Hono } from "hono";
import * as userService from "../services/user.service";
import { userListResponse } from "@oliver/shared/schemas/api";
import { z } from "zod";

const app = new Hono().get("/", async (c) => {
  try {
    const users = await userService.getAllUsers();
    const result = z.array(userListResponse).parse(users);

    return c.json(result);
  } catch (error) {
    console.error("Error in users route:", error);
    return c.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

export default app;
