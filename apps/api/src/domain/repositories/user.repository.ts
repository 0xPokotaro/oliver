import { PrismaClient } from '@oliver/database'
import { UserEntity } from '../entities/user.entity'

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(privyUserId: string, walletAddress: string): Promise<UserEntity> {
    const user = await this.prisma.user.upsert({
      where: { privyUserId },
      update: {
        walletAddress,
        updatedAt: new Date(),
      },
      create: {
        privyUserId,
        walletAddress,
      },
    })

    return UserEntity.fromPrisma(user)
  }

  async findByPrivyUserId(privyUserId: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { privyUserId },
    })

    return user ? UserEntity.fromPrisma(user) : null
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    return user ? UserEntity.fromPrisma(user) : null
  }

  async updateSmartAccountAddress(id: string, smartAccountAddress: string): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        smartAccountAddress,
        updatedAt: new Date(),
      },
    })

    return UserEntity.fromPrisma(user)
  }
}
