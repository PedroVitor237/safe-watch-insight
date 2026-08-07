import { useEffect, useState } from "react";

import { getOfflineQueueSummary } from "./inspection-store";
import { getCachedOfflineSession } from "./session";
import { synchronizeOfflineQueue } from "./sync-manager";
import type { OfflineQueueSummary } from "./types";

const EMPTY_SUMMARY: OfflineQueueSummary = {
  pending: 0,
  syncing: 0,
  failed: 0,
  conflicts: 0,
  storedInspections: 0,
  storageAvailable: false,
};

export interface OfflineRuntimeState extends OfflineQueueSummary {
  isOnline: boolean;
}

export function useOfflineState(): OfflineRuntimeState {
  const [state, setState] = useState<OfflineRuntimeState>({
    ...EMPTY_SUMMARY,
    isOnline: true,
  });

  useEffect(() => {
    let disposed = false;

    const refresh = async () => {
      const session = await getCachedOfflineSession();
      const summary = await getOfflineQueueSummary(session.success ? session.data.id : undefined);

      if (!disposed) {
        setState({ ...summary, isOnline: navigator.onLine });
      }
    };

    const handleOnline = () => {
      void refresh();
      void synchronizeOfflineQueue();
    };
    const handleOffline = () => void refresh();
    const interval = window.setInterval(() => {
      if (navigator.onLine) {
        void synchronizeOfflineQueue();
      }
    }, 30_000);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("safe-watch-offline-state", handleOffline);
    void refresh();
    if (navigator.onLine) {
      void synchronizeOfflineQueue();
    }

    return () => {
      disposed = true;
      window.clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("safe-watch-offline-state", handleOffline);
    };
  }, []);

  return state;
}
