import type { Prisma, User } from "@/generated/prisma/client";
import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";

import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserFindManyArgs,
  Prisma.UserCountArgs
> {
  constructor() {
    super(prisma.user);
  }

  findActiveById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  findActiveByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  countActiveAdmins(): Promise<number> {
    return prisma.user.count({
      where: {
        role: UserRole.ADMIN,
        deletedAt: null,
      },
    });
  }
}

export const userRepository = new UserRepository();
