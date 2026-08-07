import { getCurrentSession } from "@/lib/api/auth.functions";

import {
  clearAllOfflineData,
  clearOfflineNavigationCaches,
  getOfflineDatabase,
  isOfflineStorageAvailable,
} from "./database";
import type { OfflineSessionUser } from "./types";

const SESSION_DURATION_MS = 8 * 60 * 60 * 1_000;

type AppSessionResult = Awaited<ReturnType<typeof getCurrentSession>>;

export async function cacheOfflineSession(user: OfflineSessionUser): Promise<void> {
  if (!isOfflineStorageAvailable()) {
    return;
  }

  const db = getOfflineDatabase();
  const [currentSession, foreignPackage, foreignOperation] = await Promise.all([
    db.sessions.get("current"),
    db.inspectionPackages.where("userId").notEqual(user.id).first(),
    db.operations.where("userId").notEqual(user.id).first(),
  ]);
  const hasDataFromAnotherUser =
    (currentSession !== undefined && currentSession.user.id !== user.id) ||
    foreignPackage !== undefined ||
    foreignOperation !== undefined;

  if (hasDataFromAnotherUser) {
    await clearAllOfflineData();
  }

  const now = new Date();
  await db.sessions.put({
    key: "current",
    user,
    verifiedAt: now,
    expiresAt: new Date(now.getTime() + SESSION_DURATION_MS),
  });
}

export async function getCachedOfflineSession(): Promise<AppSessionResult> {
  if (!isOfflineStorageAvailable()) {
    return offlineAuthenticationFailure();
  }

  const session = await getOfflineDatabase().sessions.get("current");

  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) {
      await getOfflineDatabase().sessions.delete("current");
    }

    return offlineAuthenticationFailure();
  }

  return { success: true, data: session.user };
}

export async function getAppSession(): Promise<AppSessionResult> {
  if (typeof window === "undefined") {
    return getCurrentSession();
  }

  if (!navigator.onLine) {
    return getCachedOfflineSession();
  }

  try {
    const result = await getCurrentSession();

    if (result.success) {
      await cacheOfflineSession(result.data);
    } else if (result.statusCode === 401 && isOfflineStorageAvailable()) {
      await Promise.allSettled([
        getOfflineDatabase().sessions.delete("current"),
        clearOfflineNavigationCaches(),
      ]);
    }

    return result;
  } catch {
    return getCachedOfflineSession();
  }
}

function offlineAuthenticationFailure(): AppSessionResult {
  return {
    success: false,
    message: "Conecte-se novamente para validar a sessão neste dispositivo.",
    code: "OFFLINE_SESSION_UNAVAILABLE",
    statusCode: 401,
  };
}
