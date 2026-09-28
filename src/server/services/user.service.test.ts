import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import type { User } from "@/generated/prisma/client";
import { UserRole } from "@/generated/prisma/client";
import { UserRepository } from "@/server/repositories/user.repository";
import { registrationSchema } from "@/server/schemas/auth.schema";

import { UserService } from "./user.service";

function createTestService() {
  const users = new Map<string, User>();
  const repository = {
    findByEmail: async (email: string) => users.get(email) ?? null,
    findActiveByEmail: async (email: string) => users.get(email) ?? null,
    findActiveById: async (id: string) =>
      [...users.values()].find((user) => user.id === id) ?? null,
    create: async (input: { name: string; email: string; password: string; role: UserRole }) => {
      const now = new Date();
      const user: User = {
        id: randomUUID(),
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      users.set(user.email, user);
      return user;
    },
  } as unknown as UserRepository;
  return { service: new UserService(repository), users };
}

const validInput = {
  name: "  Ana Silva  ",
  email: "  ANA@EXAMPLE.COM  ",
  password: "senha-segura-123",
  confirmPassword: "senha-segura-123",
};

test("registration validates required fields, email, password and confirmation", () => {
  assert.equal(registrationSchema.safeParse({}).success, false);
  assert.equal(registrationSchema.safeParse({ ...validInput, name: " " }).success, false);
  assert.equal(registrationSchema.safeParse({ ...validInput, email: "invalid" }).success, false);
  assert.equal(
    registrationSchema.safeParse({ ...validInput, password: "short", confirmPassword: "short" })
      .success,
    false,
  );
  assert.equal(
    registrationSchema.safeParse({ ...validInput, confirmPassword: "different" }).success,
    false,
  );
  assert.equal(registrationSchema.safeParse({ ...validInput, role: "ADMIN" }).success, false);
  assert.equal(registrationSchema.safeParse({ ...validInput, id: randomUUID() }).success, false);
  assert.equal(
    registrationSchema.safeParse({ ...validInput, createdById: randomUUID() }).success,
    false,
  );
});

test("registration creates one ordinary user with bcrypt password accepted by login", async () => {
  const { service, users } = createTestService();
  const input = registrationSchema.parse(validInput);
  const registered = await service.register(input);
  assert.equal(registered.success, true);
  assert.equal(users.size, 1);
  const stored = users.get("ana@example.com");
  assert.ok(stored);
  assert.equal(stored.name, "Ana Silva");
  assert.equal(stored.role, UserRole.TECHNICIAN);
  assert.notEqual(stored.password, input.password);
  assert.match(stored.password, /^\$2[aby]\$12\$/);
  assert.equal(JSON.stringify(registered).includes(stored.password), false);
  assert.equal(JSON.stringify(registered).includes("role"), false);

  const authenticated = await service.authenticate(" ANA@EXAMPLE.COM ", input.password);
  assert.equal(authenticated.success, true);
  assert.equal(authenticated.success && authenticated.data.id, stored.id);
  assert.equal(JSON.stringify(authenticated).includes(stored.password), false);
  assert.equal((await service.authenticate(input.email, "wrong-password")).success, false);
  assert.equal((await service.getUserById(stored.id)).success, true);
});

test("duplicate email, including normalized case, does not create another user", async () => {
  const { service, users } = createTestService();
  const input = registrationSchema.parse(validInput);
  assert.equal((await service.register(input)).success, true);
  const duplicate = await service.register({ ...input, email: "Ana@Example.com" });
  assert.equal(duplicate.success, false);
  assert.equal(!duplicate.success && duplicate.code, "CONFLICT");
  assert.equal(users.size, 1);
});

test("two registered users receive distinct identities", async () => {
  const { service, users } = createTestService();
  const first = await service.register(registrationSchema.parse(validInput));
  const second = await service.register(
    registrationSchema.parse({
      ...validInput,
      name: "Bruno",
      email: "bruno@example.com",
    }),
  );
  assert.equal(first.success && second.success, true);
  assert.equal(users.size, 2);
  assert.notEqual(first.success && first.data.id, second.success && second.data.id);
});
