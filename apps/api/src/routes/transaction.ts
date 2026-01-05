import type { Env } from "../types";
import { Hono } from "hono";
import * as transactionService from "../services/transaction.service";
import { TransactionRequestSchema } from "@oliver/shared/schemas/api";

const app = new Hono<Env>()
  .get("/", async (c) => {
    const user = c.get("user");

    const result = await transactionService.getUserTransactions(user.id);
    return c.json(result);
  })
  .get("/session-details", async (c) => {
    const user = c.get("user");

    const result = await transactionService.getSessionDetails(user.id);
    return c.json(result);
  })
  .post("/", async (c) => {
    const user = c.get("user");

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
  });

export default app;
