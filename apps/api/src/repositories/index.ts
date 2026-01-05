import { PrismaClient } from "@oliver/database/generated/client";
import { ProductRepository } from "./product.repository";
import { UserRepository } from "./user.repository";
import { SessionKeyRepository } from "./session-key.repository";
import { TransactionRepository } from "./transaction.repository";
import { getPrismaClient } from "../lib/prisma";

export function createRepositories(prisma?: PrismaClient) {
  const client = prisma ?? getPrismaClient();

  return {
    product: new ProductRepository(client),
    user: new UserRepository(client),
    sessionKey: new SessionKeyRepository(client),
    transaction: new TransactionRepository(client),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;

export { ProductRepository } from "./product.repository";
export { UserRepository } from "./user.repository";
export { SessionKeyRepository } from "./session-key.repository";
export { TransactionRepository } from "./transaction.repository";
