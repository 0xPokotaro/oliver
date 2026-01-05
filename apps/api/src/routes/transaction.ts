import type { Env } from "../types";
import { Hono } from "hono";
import * as transactionService from "../services/transaction.service";
import { TransactionType } from "@oliver/shared/enums";
import { z } from "zod";

const TransactionRequestSchema = z.object({
  hash: z.string(),
  type: z.nativeEnum(TransactionType),
  sessionDetails: z.any().optional(), // sessionDetailsのJSONデータ（オプショナル）
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format').optional(),
  aiWalletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid AI wallet address format').optional(),
});

const app = new Hono<Env>()
  .get("/", async (c) => {
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

      const result = await transactionService.getUserTransactions(user.id);
      return c.json(result);
    } catch (error) {
      console.error("Error in transaction route:", error);
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
  .get("/session-details", async (c) => {
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

      const result = await transactionService.getSessionDetails(user.id);
      if (!result) {
        return c.json(
          {
            error: "Not Found",
            code: "SESSION_DETAILS_NOT_FOUND",
            message: "Session details not found",
          },
          404,
        );
      }

      return c.json(result);
    } catch (error) {
      console.error("Error in session details route:", error);
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
  .post("/", async (c) => {
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

      const body = await c.req.json();
      const validatedBody = TransactionRequestSchema.parse(body);

      const result = await transactionService.createTransaction(
        user.id,
        validatedBody.hash,
        validatedBody.type,
        validatedBody.sessionDetails,
        validatedBody.walletAddress,
        validatedBody.aiWalletAddress,
      );

      return c.json(result);
    } catch (error) {
      console.error("Error in transaction route:", error);
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

export default app;
