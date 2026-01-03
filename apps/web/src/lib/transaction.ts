import { TransactionType } from "@oliver/shared/enums";

export function getHashUrl(type: string, hash: string): string | null {
  if (type === TransactionType.SESSION_KEY_REGISTER) {
    return `https://meescan.biconomy.io/details/${hash}`;
  }
  return null;
}
