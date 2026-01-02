import { getPrismaClient } from "../lib/prisma";

export const getAllUsers = async () => {
  const prisma = getPrismaClient();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      privyUserId: true,
      wallet: {
        select: {
          address: true,
        },
      },
      smartAccountAddress: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return users.map((user) => ({
    id: user.id,
    privyUserId: user.privyUserId,
    walletAddress: user.wallet?.address ?? "",
    smartAccountAddress: user.smartAccountAddress,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
};

export const getUserProfile = async (userId: string) => {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      privyUserId: true,
      wallet: {
        select: {
          address: true,
        },
      },
      smartAccountAddress: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    privyUserId: user.privyUserId,
    walletAddress: user.wallet?.address ?? "",
    smartAccountAddress: user.smartAccountAddress,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
