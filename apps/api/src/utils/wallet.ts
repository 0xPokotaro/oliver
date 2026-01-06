import {
  generatePrivateKey,
  privateKeyToAccount,
  type PrivateKeyAccount,
} from "viem/accounts";

/**
 * ウォレットキーペアの情報
 */
export interface WalletKeyPair {
  /** 秘密鍵（hex形式） */
  privateKey: string;
  /** viemのアカウントオブジェクト */
  account: PrivateKeyAccount;
  /** ウォレットアドレス */
  address: string;
}

/**
 * 新しいウォレットキーペアを生成する
 *
 * viemを使用して、セキュアなランダムな秘密鍵とそれに対応する
 * アカウント情報を生成します。
 *
 * @returns 生成されたウォレットキーペア（秘密鍵、アカウント、アドレス）
 */
export function generateWalletKeyPair(): WalletKeyPair {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  return {
    privateKey,
    account,
    address: account.address,
  };
}
