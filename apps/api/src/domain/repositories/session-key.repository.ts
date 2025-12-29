import { PrismaClient } from '@oliver/database'
import type { SessionKey as PrismaSessionKey } from '@oliver/database'

export class SessionKeyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * ユーザーIDでセッションキーを検索（最新の1件を取得）
   */
  async findByUserId(userId: string): Promise<PrismaSessionKey | null> {
    const sessionKey = await this.prisma.sessionKey.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return sessionKey
  }

  /**
   * セッションキーアドレスで検索
   */
  async findBySessionKeyAddress(sessionKeyAddress: string): Promise<PrismaSessionKey | null> {
    const sessionKey = await this.prisma.sessionKey.findUnique({
      where: { sessionKeyAddress },
    })

    return sessionKey
  }

  /**
   * セッションキーを作成
   */
  async create(data: {
    userId: string
    encryptedPrivateKeyIv: string
    encryptedPrivateKeyContent: string
    sessionKeyAddress: string
  }): Promise<PrismaSessionKey> {
    const sessionKey = await this.prisma.sessionKey.create({
      data: {
        userId: data.userId,
        encryptedPrivateKeyIv: data.encryptedPrivateKeyIv,
        encryptedPrivateKeyContent: data.encryptedPrivateKeyContent,
        sessionKeyAddress: data.sessionKeyAddress,
      },
    })

    return sessionKey
  }
}

