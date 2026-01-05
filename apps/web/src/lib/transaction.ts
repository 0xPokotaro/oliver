import { TransactionType } from "@oliver/shared/enums";

export function getHashUrl(type: string, hash: string): string | null {
  if (
    type === TransactionType.SESSION_KEY_ACTIVATE ||
    type === TransactionType.SESSION_KEY_GRANT_PERMISSIONS
  ) {
    return `https://meescan.biconomy.io/details/${hash}`;
  }
  return null;
}
