/**
 * User API types
 */

export interface Balance {
  currency: string;
  currencyName: string;
  balance: string;
  decimals: number;
}

export interface Purchase {
  orderId: string;
  sku: string;
  productName: string;
  quantity: number;
  amount: string;
  currency: string;
  status: string;
  purchasedAt: string;
}

export interface UserInformation {
  userId: string;
  walletId: string;
  balances: Balance[];
  purchaseHistory: Purchase[];
}

