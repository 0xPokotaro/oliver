import { PrismaClient, type User } from "@oliver/database/generated/client";

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByPrivyUserId(privyUserId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { privyUserId },
    });
  }

  async create(privyUserId: string): Promise<User> {
    return await this.prisma.user.create({
      data: {
        privyUserId,
      },
    });
  }
}
