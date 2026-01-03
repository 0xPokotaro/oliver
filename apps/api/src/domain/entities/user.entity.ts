import type { User as PrismaUser } from '@oliver/database'

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly privyUserId: string,
    public readonly walletId: string | null,
    public readonly smartAccountAddress: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static fromPrisma(prismaUser: PrismaUser): UserEntity {
    return new UserEntity(
      prismaUser.id,
      prismaUser.privyUserId,
      prismaUser.walletId,
      prismaUser.smartAccountAddress,
      prismaUser.createdAt,
      prismaUser.updatedAt
    )
  }

  toPrisma(): Omit<PrismaUser, 'payments'> {
    return {
      id: this.id,
      privyUserId: this.privyUserId,
      walletId: this.walletId,
      smartAccountAddress: this.smartAccountAddress,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
