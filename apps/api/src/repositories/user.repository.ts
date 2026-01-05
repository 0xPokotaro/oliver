import { PrismaClient, type User } from "@oliver/database/generated/client";

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByPrivyUserId(privyUserId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { privyUserId },
    });
  }

  async create(privyUserId: string): Promise<User> {
    return await this.prisma.user.create({
      data: {
        privyUserId,
      },
    });
  }

  /**
   * Walletを登録
   * @param userId ユーザーID
   * @param walletAddress ウォレットアドレス
   */
  async upsertWallet(userId: string, walletAddress: string): Promise<void> {
    // Walletテーブルにupsert
    const wallet = await this.prisma.wallet.upsert({
      where: { address: walletAddress },
      update: {},
      create: {
        address: walletAddress,
      },
    });

    // UserテーブルのwalletIdを更新
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        walletId: wallet.id,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * AI Walletを登録（既に登録されている場合はスキップ）
   * @param userId ユーザーID
   * @param aiWalletAddress AIウォレットアドレス
   */
  async upsertAiWallet(userId: string, aiWalletAddress: string): Promise<void> {
    // 既存ユーザーを確認（aiWalletIdが設定されているかチェックするため）
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { aiWalletId: true },
    });

    // 既にaiWalletIdが設定されている場合はスキップ
    if (existingUser?.aiWalletId) {
      return;
    }

    // Walletテーブルにupsert
    const aiWallet = await this.prisma.wallet.upsert({
      where: { address: aiWalletAddress },
      update: {},
      create: {
        address: aiWalletAddress,
      },
    });

    // UserテーブルのaiWalletIdを更新
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        aiWalletId: aiWallet.id,
        updatedAt: new Date(),
      },
    });
  }

}
