import bcrypt from "bcrypt";

import type { User } from "@/generated/prisma/client";
import { ApiError, NotFoundError, UnauthorizedError } from "@/server/errors";
import { userRepository, UserRepository } from "@/server/repositories";
import type { Result } from "@/server/responses";

import { BaseService } from "./base.service";

export type SafeUser = Omit<User, "password">;

export class UserService extends BaseService<UserRepository> {
  constructor(repository: UserRepository = userRepository) {
    super(repository);
  }

  async authenticate(email: string, password: string): Promise<Result<SafeUser>> {
    return this.execute(async () => {
      const normalizedEmail = this.normalizeEmail(email);
      const user = await this.repository.findActiveByEmail(normalizedEmail);

      if (!user) {
        throw new UnauthorizedError("Invalid email or password.");
      }

      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        throw new UnauthorizedError("Invalid email or password.");
      }

      return this.success(this.toSafeUser(user));
    });
  }

  async getUserById(id: string): Promise<Result<SafeUser>> {
    return this.execute(async () => {
      const user = await this.repository.findActiveById(id);

      if (!user) {
        throw new NotFoundError("User not found.");
      }

      return this.success(this.toSafeUser(user));
    });
  }

  private async execute<TData>(operation: () => Promise<Result<TData>>): Promise<Result<TData>> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ApiError) {
        return this.failure(error);
      }

      throw error;
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toSafeUser(user: User): SafeUser {
    const { password: _password, ...safeUser } = user;

    return safeUser;
  }
}

export const userService = new UserService();
