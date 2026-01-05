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
 * 生成された秘密鍵は、encryption.tsのencrypt()関数を使用して
 * 暗号化し、データベースに保存する必要があります。
 *
 * @returns 生成されたウォレットキーペア（秘密鍵、アカウント、アドレス）
 *
 * @example
 * ```typescript
 * const keyPair = generateWalletKeyPair()
 * const encrypted = encrypt(keyPair.privateKey)
 * // encrypted.iv と encrypted.content をDBに保存
 * ```
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
