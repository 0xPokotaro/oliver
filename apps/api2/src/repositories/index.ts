import { PrismaClient } from "@oliver/database/generated/client";
import { ProductRepository } from "./product.repository";
import { UserRepository } from "./user.repository";
import { getPrismaClient } from "../lib/prisma";

export function createRepositories(prisma?: PrismaClient) {
  const client = prisma ?? getPrismaClient();

  return {
    product: new ProductRepository(client),
    user: new UserRepository(client),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;

export { ProductRepository } from "./product.repository";
export { UserRepository } from "./user.repository";
