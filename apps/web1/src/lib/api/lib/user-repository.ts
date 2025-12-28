// ユーザーリポジトリ

import type { PrismaClient, User } from "@oliver/database";

/**
 * ユーザーをUpsert（存在しない場合は作成、存在する場合は更新）
 */
export async function upsertUser(
  prisma: PrismaClient,
  dynamicUserId: string,
  walletAddress: string
): Promise<User> {
  const user = await prisma.user.upsert({
    where: {
      dynamicUserId,
    },
    update: {
      walletAddress,
      updatedAt: new Date(),
    },
    create: {
      dynamicUserId,
      walletAddress,
    },
  });

  return user;
}

/**
 * ユーザーIDでユーザー情報を取得
 */
export async function findUserById(
  prisma: PrismaClient,
  userId: string
): Promise<User | null> {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}
