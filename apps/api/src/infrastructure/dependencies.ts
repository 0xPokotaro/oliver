import { PrismaClient } from '@oliver/database'
import { PrismaPg } from '@prisma/adapter-pg'
import { UserRepository } from '@oliver/api/domain/repositories/user.repository'
import { SessionKeyRepository } from '@oliver/api/domain/repositories/session-key.repository'
import { AuthService } from '@oliver/api/features/auth/service'
import { generateSecretKey } from '@oliver/api/shared/utils/encryption'

// PrismaClientのシングルトンインスタンス
let prismaInstance: PrismaClient | null = null

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    // 環境変数DATABASE_URLを明示的に読み込む
    // Next.js環境では環境変数が読み込まれていない可能性があるため、
    // 明示的に設定してからPrismaClientを初期化する
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

    // PrismaPgアダプターを使用してPrismaClientを初期化
    const adapter = new PrismaPg({ connectionString })
    prismaInstance = new PrismaClient({ adapter })
  }
  return prismaInstance
}

export function createUserRepository(prisma?: PrismaClient): UserRepository {
  return new UserRepository(prisma || getPrismaClient())
}

export function createSessionKeyRepository(prisma?: PrismaClient): SessionKeyRepository {
  return new SessionKeyRepository(prisma || getPrismaClient())
}

export function createAuthService(
  userRepository?: UserRepository,
  sessionKeyRepository?: SessionKeyRepository
): AuthService {
  const userRepo = userRepository || createUserRepository()
  const sessionKeyRepo = sessionKeyRepository || createSessionKeyRepository()
  return new AuthService(userRepo, sessionKeyRepo)
}

/**
 * 暗号化機能を初期化する（アプリケーション起動時に一度だけ呼び出す）
 */
export function initializeEncryption() {
  generateSecretKey()
}
