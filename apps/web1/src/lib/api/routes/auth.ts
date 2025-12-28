import { Hono } from "hono";
import type { PrismaClient } from "@oliver/database";
import { createAuthHandler } from "../handlers/auth.handler";

export function createAuthRoutes(
  prisma: PrismaClient,
  dynamicEnvId: string,
  sessionSecret: string
) {
  const authHandler = createAuthHandler(prisma, dynamicEnvId, sessionSecret);

  const auth = new Hono()
    .post("/login", authHandler.login)
    .post("/logout", authHandler.logout);

  return auth;
}

