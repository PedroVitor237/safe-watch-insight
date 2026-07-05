import process from "node:process";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

export type PrismaClientInstance = PrismaClient;

const globalForPrisma = globalThis as typeof globalThis & {
  safeWatchPrisma?: PrismaClientInstance;
};

function createPrismaClient(): PrismaClientInstance {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize Prisma Client.");
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma: PrismaClientInstance =
  globalForPrisma.safeWatchPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.safeWatchPrisma = prisma;
}

