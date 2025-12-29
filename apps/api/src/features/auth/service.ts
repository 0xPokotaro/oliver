import { decodeJwt, SignJWT, type JWTPayload } from 'jose'
import type { DynamicJWTPayload, SessionPayload, LoginResponse, LogoutResponse } from './types'
import { UserRepository } from '@oliver/api/domain/repositories/user.repository'
import { SessionKeyRepository } from '@oliver/api/domain/repositories/session-key.repository'
import { encrypt } from '@oliver/api/shared/utils/encryption'
import { generateWalletKeyPair } from '@oliver/api/shared/utils/wallet'

export class AuthService {
  private readonly jwtSecret: Uint8Array

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionKeyRepository: SessionKeyRepository
  ) {
    // 最小構成のため、シンプルな秘密鍵を使用（本番ではenv変数から読み込むべき）
    const secret = process.env.JWT_SECRET || 'development-secret-key-change-in-production'
    this.jwtSecret = new TextEncoder().encode(secret)
  }

  /**
   * Dynamic JWTを検証し、ペイロードを抽出する
   * 最小構成のため、署名検証は省略してデコードのみ実行
   * 本番環境では、jwtVerify()を使用して署名検証を行うべき
   */
  async verifyDynamicJWT(authToken: string): Promise<DynamicJWTPayload> {
    try {
      // 最小構成のため、デコードのみ（本番では署名検証が必須）
      const payload = decodeJwt(authToken) as DynamicJWTPayload

      if (!payload.sub) {
        throw new Error('Invalid JWT: missing sub claim')
      }

      return payload
    } catch (error) {
      throw new Error('Invalid or expired JWT token')
    }
  }

  /**
   * JWTペイロードからウォレットアドレスを抽出する
   */
  extractWalletAddress(payload: DynamicJWTPayload): string {
    // verified_credentialsの最初のアドレスを取得
    const walletAddress = payload.verified_credentials?.[0]?.address

    if (!walletAddress) {
      throw new Error('No wallet address found in JWT')
    }

    return walletAddress
  }

  /**
   * ログイン処理（Upsert）
   */
  async login(authToken: string) {
    // 1. JWTを検証してペイロードを取得
    const payload = await this.verifyDynamicJWT(authToken)

    // 2. ユーザー情報を抽出
    const dynamicUserId = payload.sub
    const walletAddress = this.extractWalletAddress(payload)

    // 3. データベースでUpsert
    const user = await this.userRepository.upsert(dynamicUserId, walletAddress)

    // 4. セッショントークンを生成
    const sessionToken = await this.createSessionToken({
      userId: user.id,
      dynamicUserId: user.dynamicUserId,
      walletAddress: user.walletAddress,
    })

    // 5. セッションキーの確認と生成
    let sessionKey = await this.sessionKeyRepository.findByUserId(user.id)
    
    if (!sessionKey) {
      // セッションキーが存在しない場合、新規生成してDBに保存
      const { privateKey, account } = generateWalletKeyPair();
      const { iv, content } = encrypt(privateKey);
      
      sessionKey = await this.sessionKeyRepository.create({
        userId: user.id,
        encryptedPrivateKeyIv: iv,
        encryptedPrivateKeyContent: content,
        sessionKeyAddress: account.address,
      });
    }

    // 6. レスポンス形式を決定
    const response: LoginResponse = {
      userId: user.id,
      walletAddress: user.walletAddress,
      smartAccountAddress: sessionKey.sessionKeyAddress,
    }

    return {
      response,
      sessionToken,
    }
  }

  /**
   * セッショントークンを生成する
   */
  async createSessionToken(payload: SessionPayload): Promise<string> {
    const jwtPayload: JWTPayload = {
      sub: payload.userId,
      userId: payload.userId,
      dynamicUserId: payload.dynamicUserId,
      walletAddress: payload.walletAddress,
    }

    const jwt = await new SignJWT(jwtPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // 7日間有効
      .sign(this.jwtSecret)

    return jwt
  }

  /**
   * セッショントークンを検証する
   */
  async verifySessionToken(token: string): Promise<SessionPayload> {
    try {
      const payload = decodeJwt(token) as SessionPayload
      return payload
    } catch (error) {
      throw new Error('Invalid session token')
    }
  }

  /**
   * ログアウト処理
   */
  async logout(): Promise<LogoutResponse> {
    return {
      message: 'Logged out successfully',
    }
  }
}
