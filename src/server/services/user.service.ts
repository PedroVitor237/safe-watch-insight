import { Prisma, UserRole } from "@/generated/prisma/client";

import type { User } from "@/generated/prisma/client";
import { comparePassword, hashPassword } from "@/server/auth/password";
import { ApiError, ConflictError, NotFoundError, UnauthorizedError } from "@/server/errors";
import { userRepository, UserRepository } from "@/server/repositories";
import type { Result } from "@/server/responses";

import { BaseService } from "./base.service";

export type SafeUser = Omit<User, "password">;
export type RegisteredUser = Pick<User, "id" | "name" | "email">;

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export class UserService extends BaseService<UserRepository> {
  constructor(repository: UserRepository = userRepository) {
    super(repository);
  }

  async register(input: RegisterUserInput): Promise<Result<RegisteredUser>> {
    return this.execute(async () => {
      const email = this.normalizeEmail(input.email);

      if (await this.repository.findByEmail(email)) {
        throw new ConflictError("Este e-mail já está cadastrado.");
      }

      const password = await hashPassword(input.password);
      const user = await this.repository.create({
        name: input.name.trim(),
        email,
        password,
        role: UserRole.TECHNICIAN,
      });

      return this.success({ id: user.id, name: user.name, email: user.email });
    });
  }

  async authenticate(email: string, password: string): Promise<Result<SafeUser>> {
    return this.execute(async () => {
      const normalizedEmail = this.normalizeEmail(email);
      const user = await this.repository.findActiveByEmail(normalizedEmail);

      if (!user) {
        throw new UnauthorizedError("Invalid email or password.");
      }

      const passwordMatches = await comparePassword(password, user.password);

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

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return this.failure(new ConflictError("Este e-mail já está cadastrado."));
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
