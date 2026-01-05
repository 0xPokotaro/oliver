import {
  PrismaClient,
  type Transaction,
  type UserTransaction,
  type SessionDetails,
  Prisma,
} from "@oliver/database/generated/client";

export class TransactionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * トランザクションをhashで検索、存在しなければ作成
   */
  async findOrCreateTransaction(hash: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { hash },
    });

    if (transaction) {
      return transaction;
    }

    return await this.prisma.transaction.create({
      data: { hash },
    });
  }

  /**
   * UserTransactionレコードを作成
   */
  async createUserTransaction(data: {
    userId: string;
    transactionId: string;
    type: string;
  }): Promise<UserTransaction> {
    return await this.prisma.userTransaction.create({
      data: {
        userId: data.userId,
        transactionId: data.transactionId,
        type: data.type,
      },
    });
  }

  /**
   * ユーザーIDでトランザクション一覧を取得（UserTransactionとTransactionをJOIN）
   */
  async findByUserId(userId: string) {
    return await this.prisma.userTransaction.findMany({
      where: { userId },
      include: {
        transaction: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * SessionDetailsをupsert（存在すれば更新、なければ作成）
   */
  async upsertSessionDetails(
    userId: string,
    sessionDetails: Prisma.InputJsonValue,
  ): Promise<SessionDetails> {
    return await this.prisma.sessionDetails.upsert({
      where: { userId },
      update: {
        sessionDetails,
        updatedAt: new Date(),
      },
      create: {
        userId,
        sessionDetails,
      },
    });
  }

  /**
   * ユーザーIDでSessionDetailsを取得
   */
  async getSessionDetailsByUserId(
    userId: string,
  ): Promise<SessionDetails | null> {
    return await this.prisma.sessionDetails.findUnique({
      where: { userId },
    });
  }
}
