import crypto from 'node:crypto'

/**
 * 暗号化ユーティリティ
 *
 * このモジュールは、ウォレットの秘密鍵をDBに安全に保存するための
 * 暗号化・復号機能を提供します。
 *
 * - アルゴリズム: AES-256-CBC
 * - 用途: ウォレットの秘密鍵を暗号化してデータベースに保存
 * - 初期化: アプリケーション起動時に一度だけgenerateSecretKey()を呼び出す
 */

const ALGORITHM = 'aes-256-cbc'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16  // 128 bits

/**
 * 暗号化に使用する秘密鍵（アプリケーションのライフサイクル中は同一の鍵を使用）
 */
let secretKey: Buffer | null = null

/**
 * 暗号化用の秘密鍵を生成する
 *
 * アプリケーション起動時に一度だけ呼び出されます。
 * この鍵は、ウォレットの秘密鍵を暗号化してDBに保存する際に使用されます。
 *
 * @returns 生成された秘密鍵（32バイト）
 * @throws 既に秘密鍵が生成済みの場合、新しい鍵は生成せず既存の鍵を返す
 */
export function generateSecretKey(): Buffer {
  if (!secretKey) {
    secretKey = crypto.randomBytes(KEY_LENGTH)
  }
  return secretKey
}

/**
 * 暗号化用の秘密鍵を設定する
 *
 * テストやデバッグ時に特定の秘密鍵を設定する場合に使用します。
 * 本番環境では使用しないでください。
 *
 * @param key - 設定する秘密鍵（32バイト必須）
 * @throws 秘密鍵が32バイトでない場合はエラー
 */
export function setSecretKey(key: Buffer): void {
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Secret key must be ${KEY_LENGTH} bytes`)
  }
  secretKey = key
}

/**
 * テキストを暗号化する
 *
 * @param text - 暗号化するテキスト（ウォレットの秘密鍵など）
 * @returns 暗号化されたデータ（IV と暗号化コンテンツ）
 * @throws 秘密鍵が初期化されていない場合はエラー
 */
export function encrypt(text: string): { iv: string; content: string } {
  if (!secretKey) {
    throw new Error('Secret key not initialized. Call generateSecretKey() first.')
  }

  // セキュリティのため、暗号化ごとにランダムなIV（初期化ベクトル）を生成
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, secretKey, iv)

  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
  }
}

/**
 * 暗号化されたテキストを復号する
 *
 * @param ivHex - 暗号化時に使用されたIV（16進数文字列）
 * @param contentHex - 暗号化されたコンテンツ（16進数文字列）
 * @returns 復号されたテキスト
 * @throws 秘密鍵が初期化されていない場合、または復号に失敗した場合はエラー
 */
export function decrypt(ivHex: string, contentHex: string): string {
  if (!secretKey) {
    throw new Error('Secret key not initialized. Call generateSecretKey() first.')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const encryptedText = Buffer.from(contentHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, iv)

  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}
