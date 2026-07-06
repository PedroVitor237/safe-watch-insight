import process from "node:process";

import { clearSession, getSession, updateSession } from "@tanstack/react-start/server";

import { UnauthorizedError } from "@/server/errors";
import type { Result } from "@/server/responses";
import { failure } from "@/server/responses";
import { userService, type SafeUser } from "@/server/services";

const SESSION_NAME = "safe_watch_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
const DEVELOPMENT_SESSION_SECRET = "safe-watch-insight-development-session-secret";

interface AuthSessionData {
  userId?: string;
}

function getSessionPassword(): string {
  const sessionSecret = process.env.SESSION_SECRET?.trim();

  if (sessionSecret) {
    return sessionSecret;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEVELOPMENT_SESSION_SECRET;
  }

  throw new UnauthorizedError("Session secret is not configured.");
}

function getSessionConfig() {
  return {
    name: SESSION_NAME,
    password: getSessionPassword(),
    maxAge: SESSION_MAX_AGE_SECONDS,
    cookie: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  };
}

export async function createAuthSession(userId: string): Promise<void> {
  await updateSession<AuthSessionData>(getSessionConfig(), { userId });
}

export async function clearAuthSession(): Promise<void> {
  await clearSession(getSessionConfig());
}

export async function getAuthenticatedUser(): Promise<Result<SafeUser>> {
  try {
    const session = await getSession<AuthSessionData>(getSessionConfig());
    const userId = session.data.userId;

    if (!userId) {
      throw new UnauthorizedError("Authentication required.");
    }

    const result = await userService.getUserById(userId);

    if (!result.success) {
      await clearAuthSession();
    }

    return result;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return failure(error);
    }

    throw error;
  }
}

export async function requireAuthenticatedUser(): Promise<SafeUser> {
  const result = await getAuthenticatedUser();

  if (!result.success) {
    throw new UnauthorizedError(result.message);
  }

  return result.data;
}
