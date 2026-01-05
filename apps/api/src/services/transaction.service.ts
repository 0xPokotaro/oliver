import { createRepositories } from "../repositories";
import { TransactionType } from "@oliver/shared/enums";
import { NotFoundError } from "../lib/error/classes";

export interface CreateTransactionResponse {
  id: string;
  userId: string;
  transactionId: string;
  hash: string;
  type: string;
  createdAt: Date;
}

export interface TransactionListItem {
  id: string;
  type: string;
  hash: string;
  createdAt: Date;
}

export const createTransaction = async (
  userId: string,
  hash: string,
  type: TransactionType,
  sessionDetails?: unknown,
  walletAddress?: string,
  aiWalletAddress?: string,
): Promise<CreateTransactionResponse> => {
  const repositories = createRepositories();

  // 1. Transactionを検索または作成
  const transaction =
    await repositories.transaction.findOrCreateTransaction(hash);

  // 2. UserTransactionを作成
  const userTransaction = await repositories.transaction.createUserTransaction({
    userId,
    transactionId: transaction.id,
    type: type,
  });

  // 3. SESSION_KEY_GRANT_PERMISSIONSの場合、sessionDetailsを保存
  if (
    type === TransactionType.SESSION_KEY_GRANT_PERMISSIONS &&
    sessionDetails
  ) {
    await repositories.transaction.upsertSessionDetails(
      userId,
      sessionDetails as any,
    );
  }

  // 4. walletAddressが提供されている場合、Walletを登録
  if (walletAddress) {
    await repositories.user.upsertWallet(userId, walletAddress);
  }

  // 5. aiWalletAddressが提供されている場合、AI Walletを登録（既に登録されている場合はスキップ）
  if (aiWalletAddress) {
    await repositories.user.upsertAiWallet(userId, aiWalletAddress);
  }

  // 6. レスポンス形式を返却
  return {
    id: userTransaction.id,
    userId: userTransaction.userId,
    transactionId: userTransaction.transactionId,
    hash: transaction.hash,
    type: userTransaction.type,
    createdAt: userTransaction.createdAt,
  };
};

export const getUserTransactions = async (
  userId: string,
): Promise<TransactionListItem[]> => {
  const repositories = createRepositories();

  const userTransactions = await repositories.transaction.findByUserId(userId);

  return userTransactions.map((ut) => ({
    id: ut.id,
    type: ut.type,
    hash: ut.transaction.hash,
    createdAt: ut.createdAt,
  }));
};

export const getSessionDetails = async (
  userId: string,
): Promise<{ sessionDetails: unknown }> => {
  const repositories = createRepositories();

  const sessionDetails =
    await repositories.transaction.getSessionDetailsByUserId(userId);

  if (!sessionDetails) {
    throw new NotFoundError(
      "Session details not found",
      "SESSION_DETAILS_NOT_FOUND",
    );
  }

  return {
    sessionDetails: sessionDetails.sessionDetails,
  };
};
