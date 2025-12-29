import type { User as PrismaUser } from '@oliver/database'

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly dynamicUserId: string,
    public readonly walletAddress: string,
    public readonly smartAccountAddress: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static fromPrisma(prismaUser: PrismaUser): UserEntity {
    return new UserEntity(
      prismaUser.id,
      prismaUser.dynamicUserId,
      prismaUser.walletAddress,
      prismaUser.smartAccountAddress,
      prismaUser.createdAt,
      prismaUser.updatedAt
    )
  }

  toPrisma(): Omit<PrismaUser, 'payments'> {
    return {
      id: this.id,
      dynamicUserId: this.dynamicUserId,
      walletAddress: this.walletAddress,
      smartAccountAddress: this.smartAccountAddress,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
