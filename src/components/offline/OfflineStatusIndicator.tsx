import { AlertTriangle, Cloud, CloudOff, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOfflineState } from "@/offline/use-offline-state";
import { retryOfflineQueue, synchronizeOfflineQueue } from "@/offline/sync-manager";

export function OfflineStatusIndicator() {
  const state = useOfflineState();
  const queued = state.pending + state.syncing + state.failed + state.conflicts;

  const label = state.conflicts
    ? `${state.conflicts} conflito(s)`
    : state.failed
      ? `${state.failed} falha(s)`
      : state.syncing
        ? "Sincronizando"
        : state.pending
          ? `${state.pending} pendente(s)`
          : state.isOnline
            ? "Online"
            : "Offline";
  const Icon = state.conflicts || state.failed ? AlertTriangle : state.isOnline ? Cloud : CloudOff;
  const tone =
    state.conflicts || state.failed
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : state.isOnline
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";

  async function synchronize() {
    if (state.failed > 0) {
      await retryOfflineQueue();
    } else {
      await synchronizeOfflineQueue();
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tone}`}
        title={
          state.storageAvailable
            ? `${state.storedInspections} inspeção(ões) disponível(is) localmente`
            : "IndexedDB indisponível"
        }
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{label}</span>
        {!state.isOnline && queued > 0 && <span className="sm:hidden">{queued}</span>}
      </div>
      {state.isOnline && (state.pending > 0 || state.failed > 0) && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => void synchronize()}
          aria-label="Sincronizar dados locais"
        >
          <RefreshCw className={`h-4 w-4 ${state.syncing ? "animate-spin" : ""}`} />
        </Button>
      )}
    </div>
  );
}
