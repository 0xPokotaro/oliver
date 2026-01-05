import { z } from "zod";
import { TransactionType } from "@oliver/shared/enums";

export const TransactionRequestSchema = z.object({
  hash: z.string(),
  type: z.nativeEnum(TransactionType),
  sessionDetails: z.any().optional(), // sessionDetailsのJSONデータ（オプショナル）
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format').optional(),
  aiWalletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid AI wallet address format').optional(),
});

export type TransactionRequestSchema = z.infer<typeof TransactionRequestSchema>;

