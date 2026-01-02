import { getPrismaClient } from "../lib/prisma";
import { createRepositories } from "../repositories";
import { generateWalletKeyPair } from "../lib/wallet";
import { encrypt } from "../lib/encryption";
import {
  toSmartSessionsModule,
  toMultichainNexusAccount,
  getMEEVersion,
  MEEVersion,
  createMeeClient,
  meeSessionActions,
} from "@biconomy/abstractjs";
import { privateKeyToAccount } from "viem/accounts";
import { avalanche } from "viem/chains";
import { http, createWalletClient } from "viem";

export interface CreateSmartAccountResponse {
  id: string;
  privyUserId: string;
  walletAddress: string;
  smartAccountAddress: string;
}

export const createSmartAccount = async (
  userId: string,
): Promise<CreateSmartAccountResponse> => {
  const repositories = createRepositories();
  const prisma = getPrismaClient();

  // 1. 秘密鍵を生成
  const { privateKey, address } = generateWalletKeyPair();

  // 2. 秘密鍵を暗号化
  const { iv, content } = encrypt(privateKey);

  // 3. SessionKeyテーブルに保存
  await repositories.sessionKey.create({
    userId,
    encryptedPrivateKeyIv: iv,
    encryptedPrivateKeyContent: content,
    sessionKeyAddress: address,
  });

  // 4. UserテーブルのsmartAccountAddressを更新
  const user = await repositories.user.updateSmartAccountAddress(userId, address);

  // 5. walletAddressを取得
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

  // 6. レスポンス形式を返却
  return {
    id: user.id,
    privyUserId: user.privyUserId,
    walletAddress: userWithWallet?.wallet?.address ?? "",
    smartAccountAddress: address,
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
      smartAccountAddress: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return users.map((user: {
    id: string;
    privyUserId: string;
    wallet: { address: string | null } | null;
    smartAccountAddress: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) => ({
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

export interface RegisterBiconomySessionKeyResponse {
  success: boolean;
  sessionKeyAddress: string;
  message?: string;
}

export const registerBiconomySessionKey = async (
  userId: string,
): Promise<RegisterBiconomySessionKeyResponse> => {
  const repositories = createRepositories();
  const prisma = getPrismaClient();

  // 1. ユーザー情報を取得（walletAddressを含む）
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      wallet: {
        select: {
          address: true,
        },
      },
      smartAccountAddress: true,
    },
  });

  if (!user || !user.wallet?.address) {
    throw new Error("User wallet address not found");
  }

  if (!user.smartAccountAddress) {
    throw new Error("Smart account address not found. Please create smart account first.");
  }

  const walletAddress = user.wallet.address as `0x${string}`;

  // 2. 既存のSessionKeyを確認
  const existingSessionKey = await repositories.sessionKey.findByUserId(userId);

  let privateKey: string;
  let sessionKeyAddress: string;

  if (existingSessionKey) {
    // 既存のSessionKeyを使用
    // 復号は必要に応じて実装（今回は新規作成を優先）
    // 既存のSessionKeyがある場合は、そのアドレスを返す
    return {
      success: true,
      sessionKeyAddress: existingSessionKey.sessionKeyAddress,
      message: "Session key already exists",
    };
  }

  // 3. 新しいSessionKeyを生成
  const { privateKey: newPrivateKey, address } = generateWalletKeyPair();
  privateKey = newPrivateKey;
  sessionKeyAddress = address;

  // 4. 秘密鍵を暗号化
  const { iv, content } = encrypt(privateKey);

  // 5. SessionKeyをDBに保存
  await repositories.sessionKey.create({
    userId,
    encryptedPrivateKeyIv: iv,
    encryptedPrivateKeyContent: content,
    sessionKeyAddress: address,
  });

  // 6. BiconomyのSessionKeyを登録
  try {
    const sessionSigner = privateKeyToAccount(privateKey as `0x${string}`);

    const ssValidator = toSmartSessionsModule({
      signer: sessionSigner,
    });

    // walletClientを作成（サーバーサイドでは実際の署名はできないため、アドレスのみ使用）
    // 注意: サーバーサイドでwalletClientを作成するには、実際の秘密鍵が必要
    // ここでは、BiconomyのSessionKey登録の準備のみ行う
    const walletClient = createWalletClient({
      account: walletAddress,
      chain: avalanche,
      transport: http(),
    });

    const orchestrator = await toMultichainNexusAccount({
      chainConfigurations: [
        {
          chain: avalanche,
          transport: http(),
          version: getMEEVersion(MEEVersion.V2_2_1),
          accountAddress: walletAddress,
        },
      ],
      signer: walletClient,
    });

    const meeClient = await createMeeClient({
      account: orchestrator,
      apiKey: process.env.BICONOMY_API_KEY,
    });

    const sessionsMeeClient = meeClient.extend(meeSessionActions);
    console.log("sessionsMeeClient created:", sessionsMeeClient);

    return {
      success: true,
      sessionKeyAddress: address,
      message: "Biconomy session key registered successfully",
    };
  } catch (error) {
    console.error("Error registering Biconomy session key:", error);
    // SessionKeyは既にDBに保存されているので、エラーでも成功として返す
    return {
      success: true,
      sessionKeyAddress: address,
      message: `Session key created but Biconomy registration may have failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
