import bcrypt from "bcrypt";
import process from "node:process";

import type { User } from "@/generated/prisma/client";
import { UserRole } from "@/generated/prisma/client";
import { ApiError, ConflictError, NotFoundError, UnauthorizedError } from "@/server/errors";
import { userRepository, UserRepository } from "@/server/repositories";
import type { Result } from "@/server/responses";

import { BaseService } from "./base.service";

const PASSWORD_HASH_ROUNDS = 12;

export type SafeUser = Omit<User, "password">;

interface InitialAdminConfig {
  name: string;
  email: string;
  password: string;
}

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

  async createInitialAdminIfNeeded(): Promise<Result<SafeUser | null>> {
    return this.execute(async () => {
      const config = this.getInitialAdminConfig();

      if (!config) {
        return this.success(null);
      }

      const activeAdminCount = await this.repository.countActiveAdmins();

      if (activeAdminCount > 0) {
        return this.success(null);
      }

      const email = this.normalizeEmail(config.email);
      const existingUser = await this.repository.findActiveByEmail(email);

      if (existingUser) {
        throw new ConflictError("A user with the initial admin email already exists.");
      }

      const passwordHash = await bcrypt.hash(config.password, PASSWORD_HASH_ROUNDS);
      const admin = await this.repository.create({
        name: config.name,
        email,
        password: passwordHash,
        role: UserRole.ADMIN,
      });

      return this.success(this.toSafeUser(admin));
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

  private getInitialAdminConfig(): InitialAdminConfig | null {
    const name = process.env.INITIAL_ADMIN_NAME?.trim();
    const email = process.env.INITIAL_ADMIN_EMAIL?.trim();
    const password = process.env.INITIAL_ADMIN_PASSWORD;

    if (!name || !email || !password) {
      return null;
    }

    return {
      name,
      email,
      password,
    };
  }

  private toSafeUser(user: User): SafeUser {
    const { password: _password, ...safeUser } = user;

    return safeUser;
  }
}

export const userService = new UserService();
