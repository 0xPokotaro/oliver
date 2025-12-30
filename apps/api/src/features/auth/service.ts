import { SignJWT, jwtVerify, importSPKI, type JWTPayload, decodeJwt } from 'jose'
import type { PrivyJWTPayload, SessionPayload, LoginResponse, LogoutResponse } from './types'
import { UserRepository } from '@oliver/api/domain/repositories/user.repository'
import { SessionKeyRepository } from '@oliver/api/domain/repositories/session-key.repository'
import { encrypt } from '@oliver/api/shared/utils/encryption'
import { generateWalletKeyPair } from '@oliver/api/shared/utils/wallet'

export class AuthService {
  private readonly jwtSecret: Uint8Array
  private readonly privyAppId: string
  private readonly privyVerificationKey: string | null

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionKeyRepository: SessionKeyRepository
  ) {
    // 最小構成のため、シンプルな秘密鍵を使用（本番ではenv変数から読み込むべき）
    const secret = process.env.JWT_SECRET || 'development-secret-key-change-in-production'
    this.jwtSecret = new TextEncoder().encode(secret)
    
    // Privyの設定
    this.privyAppId = process.env.PRIVY_APP_ID || ''
    this.privyVerificationKey = process.env.PRIVY_VERIFICATION_KEY || null
    
    if (!this.privyAppId) {
      throw new Error('PRIVY_APP_ID must be set')
    }
    
    // 検証キーが設定されていない場合は警告
    if (!this.privyVerificationKey) {
      console.warn('PRIVY_VERIFICATION_KEY is not set. Token verification may fail.')
    }
  }

  /**
   * Privyのアクセストークンを検証し、ペイロードを抽出する
   * PrivyのJWTをES256アルゴリズムで検証（ドキュメントに基づく）
   * 注意: JWTにはウォレット情報が含まれていないため、別途取得が必要な場合はManagement APIを使用
   */
  async verifyPrivyToken(accessToken: string): Promise<PrivyJWTPayload> {
    try {
      // 検証キーが設定されていない場合は、デコードのみ（署名検証なし）
      if (!this.privyVerificationKey) {
        const decoded = decodeJwt(accessToken)

        // 基本的な検証（issuerとaudienceのチェック）
        if (decoded.iss !== 'privy.io') {
          throw new Error('Invalid token issuer')
        }
        if (decoded.aud !== this.privyAppId) {
          throw new Error('Invalid token audience')
        }
        
        const privyUserId = decoded.sub as string
        if (!privyUserId) {
          throw new Error('Invalid Privy token: missing user ID (sub)')
        }

        return {
          sub: privyUserId,
          iat: decoded.iat,
          exp: decoded.exp,
        }
      }

      // 検証キーを使用してJWTを検証
      const verificationKey = await importSPKI(
        this.privyVerificationKey,
        'ES256'
      )

      const { payload } = await jwtVerify(accessToken, verificationKey, {
        issuer: 'privy.io',
        audience: this.privyAppId,
      })

      const privyUserId = payload.sub as string
      if (!privyUserId) {
        throw new Error('Invalid Privy token: missing user ID (sub)')
      }

      return {
        sub: privyUserId,
        iat: payload.iat,
        exp: payload.exp,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Invalid or expired Privy token: ${error.message}`)
      }
      throw new Error('Invalid or expired Privy token')
    }
  }

  /**
   * ログイン処理（Upsert）
   * @param authToken Privyのアクセストークン
   * @param walletAddress ウォレットアドレス（必須、フロントエンドから送信）
   */
  async login(authToken: string, walletAddress: string) {
    // 1. Privyトークンを検証してペイロードを取得
    const payload = await this.verifyPrivyToken(authToken)

    // 2. ユーザー情報を抽出
    const privyUserId = payload.sub
    
    // 3. ウォレットアドレスの検証
    // フロントエンドから送信されたウォレットアドレスを使用
    if (!walletAddress) {
      throw new Error('WALLET_NOT_FOUND: Wallet address is required')
    }

    // 4. データベースでUpsert
    const user = await this.userRepository.upsert(privyUserId, walletAddress)

    // 5. セッショントークンを生成
    const sessionToken = await this.createSessionToken({
      userId: user.id,
      privyUserId: user.privyUserId,
      walletAddress: user.walletAddress,
    })

    // 6. セッションキーの確認と生成
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

    // 7. レスポンス形式を決定
    const response: LoginResponse = {
      userId: user.id,
      walletAddress: user.walletAddress,
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
      privyUserId: payload.privyUserId,
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
      const { payload } = await jwtVerify(token, this.jwtSecret)
      return payload as unknown as SessionPayload
    } catch (error) {
      throw new Error('Invalid or expired session token')
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
