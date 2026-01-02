import { Hono } from "hono";
import * as userService from "../services/user.service";
import { userListResponse, userProfileResponse } from "@oliver/shared/schemas/api";
import { z } from "zod";
import type { Env } from "../types";

const app = new Hono<Env>()
  .get("/", async (c) => {
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
  })
  .get("/profile", async (c) => {
    try {
      const user = c.get("user");
      if (!user || !user.id) {
        return c.json(
          {
            error: "Unauthorized",
            code: "UNAUTHORIZED",
            message: "User not found in context",
          },
          401,
        );
      }

      const profile = await userService.getUserProfile(user.id);
      if (!profile) {
        return c.json(
          {
            error: "Not Found",
            code: "USER_NOT_FOUND",
            message: "User profile not found",
          },
          404,
        );
      }

      const result = userProfileResponse.parse(profile);
      return c.json(result);
    } catch (error) {
      console.error("Error in user profile route:", error);
      return c.json(
        {
          error: "Internal server error",
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : String(error),
        },
        500,
      );
    }
  })
  .post("/smart-account", async (c) => {
    try {
      const user = c.get("user");
      if (!user || !user.id) {
        return c.json(
          {
            error: "Unauthorized",
            code: "UNAUTHORIZED",
            message: "User not found in context",
          },
          401,
        );
      }

      const result = await userService.createSmartAccount(user.id);
      return c.json(result);
    } catch (error) {
      console.error("Error in create smart account route:", error);
      return c.json(
        {
          error: "Internal server error",
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : String(error),
        },
        500,
      );
    }
  })
  .post("/session-key", async (c) => {
    try {
      const user = c.get("user");
      if (!user || !user.id) {
        return c.json(
          {
            error: "Unauthorized",
            code: "UNAUTHORIZED",
            message: "User not found in context",
          },
          401,
        );
      }

      const result = await userService.registerBiconomySessionKey(user.id);
      return c.json(result);
    } catch (error) {
      console.error("Error in register Biconomy session key route:", error);
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
