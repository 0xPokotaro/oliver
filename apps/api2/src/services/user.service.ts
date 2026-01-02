import { getPrismaClient } from "@oliver/api/lib/prisma";

export const getAllUsers = async () => {
  const prisma = getPrismaClient();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      privyUserId: true,
      walletAddress: true,
      smartAccountAddress: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return users;
};
