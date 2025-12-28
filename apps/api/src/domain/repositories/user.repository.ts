import { PrismaClient } from '@oliver/database'
import { UserEntity } from '../entities/user.entity'

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(dynamicUserId: string, walletAddress: string): Promise<UserEntity> {
    const user = await this.prisma.user.upsert({
      where: { dynamicUserId },
      update: {
        walletAddress,
        updatedAt: new Date(),
      },
      create: {
        dynamicUserId,
        walletAddress,
      },
    })

    return UserEntity.fromPrisma(user)
  }

  async findByDynamicUserId(dynamicUserId: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { dynamicUserId },
    })

    return user ? UserEntity.fromPrisma(user) : null
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    return user ? UserEntity.fromPrisma(user) : null
  }
}
