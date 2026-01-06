import { getPrismaClient } from "../lib/prisma";
import { NotFoundError } from "../lib/error/classes";
import { privateKeyToAccount } from "viem/accounts";
import { getSessionSignerPrivateKey } from "../utils/config";

export interface CreateSmartAccountResponse {
  id: string;
  privyUserId: string;
  walletAddress: string;
  smartAccountAddress: string;
}

export const createSmartAccount = async (
  userId: string,
): Promise<CreateSmartAccountResponse> => {
  const prisma = getPrismaClient();

  // アプリケーション全体で共有されるSmartAccountアドレスを計算
  const sessionSigner = privateKeyToAccount(getSessionSignerPrivateKey());
  const smartAccountAddress = sessionSigner.address;

  // walletAddressを取得
  const userWithWallet = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      privyUserId: true,
      wallet: {
        select: {
          address: true,
        },
      },
    },
  });

  if (!userWithWallet) {
    throw new Error("User not found");
  }

  // レスポンス形式を返却
  return {
    id: userWithWallet.id,
    privyUserId: userWithWallet.privyUserId,
    walletAddress: userWithWallet.wallet?.address ?? "",
    smartAccountAddress,
  };
};

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
      createdAt: true,
      updatedAt: true,
    },
  });

  // アプリケーション全体で共有されるSmartAccountアドレスを計算
  const sessionSigner = privateKeyToAccount(getSessionSignerPrivateKey());
  const smartAccountAddress = sessionSigner.address;

  return users.map(
    (user: {
      id: string;
      privyUserId: string;
      wallet: { address: string | null } | null;
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: user.id,
      privyUserId: user.privyUserId,
      walletAddress: user.wallet?.address ?? "",
      smartAccountAddress,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }),
  );
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
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError("User profile not found", "USER_NOT_FOUND");
  }

  // アプリケーション全体で共有されるSmartAccountアドレスを計算
  const sessionSigner = privateKeyToAccount(getSessionSignerPrivateKey());
  const smartAccountAddress = sessionSigner.address;

  return {
    id: user.id,
    privyUserId: user.privyUserId,
    walletAddress: user.wallet?.address ?? "",
    smartAccountAddress,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
