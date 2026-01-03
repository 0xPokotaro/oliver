import { createRepositories } from "../repositories";
import { TransactionType } from "@oliver/shared/enums";

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
): Promise<CreateTransactionResponse> => {
  const repositories = createRepositories();

  // 1. Transactionを検索または作成
  const transaction = await repositories.transaction.findOrCreateTransaction(hash);

  // 2. UserTransactionを作成
  const userTransaction = await repositories.transaction.createUserTransaction({
    userId,
    transactionId: transaction.id,
    type: type,
  });

  // 3. レスポンス形式を返却
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

