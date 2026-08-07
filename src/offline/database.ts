import Dexie, { type EntityTable } from "dexie";

import type { OfflineInspectionPackage, OfflineOperation, OfflineSessionRecord } from "./types";

export class SafeWatchOfflineDatabase extends Dexie {
  sessions!: EntityTable<OfflineSessionRecord, "key">;
  inspectionPackages!: EntityTable<OfflineInspectionPackage, "key">;
  operations!: EntityTable<OfflineOperation, "id">;

  constructor(name = "safe-watch-insight") {
    super(name);

    this.version(1).stores({
      sessions: "&key, expiresAt",
      inspectionPackages:
        "&key, userId, inspectionId, [userId+inspectionId], localSyncStatus, cachedAt",
      operations:
        "&id, userId, inspectionId, entityKey, type, status, sequence, createdAt, nextAttemptAt, dependsOnOperationId, [userId+status], [inspectionId+entityKey]",
    });
  }
}

let database: SafeWatchOfflineDatabase | null = null;

export function isOfflineStorageAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

export function getOfflineDatabase(): SafeWatchOfflineDatabase {
  if (!isOfflineStorageAvailable()) {
    throw new Error("IndexedDB is not available in this environment.");
  }

  database ??= new SafeWatchOfflineDatabase();

  return database;
}

export async function clearAllOfflineData(): Promise<void> {
  const cleanupTasks: Promise<void>[] = [];

  if (isOfflineStorageAvailable()) {
    const db = getOfflineDatabase();
    cleanupTasks.push(
      db.transaction("rw", db.sessions, db.inspectionPackages, db.operations, async () => {
        await Promise.all([
          db.sessions.clear(),
          db.inspectionPackages.clear(),
          db.operations.clear(),
        ]);
      }),
    );
  }

  if (typeof caches !== "undefined") {
    cleanupTasks.push(clearOfflineNavigationCaches());
  }

  const results = await Promise.allSettled(cleanupTasks);
  notifyOfflineStateChanged();

  if (results.some((result) => result.status === "rejected")) {
    throw new Error("Não foi possível remover todos os dados offline deste dispositivo.");
  }
}

export async function clearOfflineNavigationCaches(): Promise<void> {
  if (typeof caches === "undefined") {
    return;
  }

  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((cacheName) => /^safe-watch-.*-navigation$/.test(cacheName))
      .map((cacheName) => caches.delete(cacheName)),
  );
}

export function notifyOfflineStateChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("safe-watch-offline-state"));
  }
}

export function notifyOfflineSynchronizationCompleted(inspectionId: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("safe-watch-offline-synchronized", { detail: { inspectionId } }),
    );
  }
}
