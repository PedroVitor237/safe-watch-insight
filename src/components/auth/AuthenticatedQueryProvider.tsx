import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

import { inspectionQueryKeys } from "@/lib/api/inspection.query-keys";
import { inspectionResponseQueryKeys } from "@/lib/api/inspection-response.query-keys";
import { nonConformityQueryKeys } from "@/lib/api/non-conformity.query-keys";

// The guarded layout keys this provider by user ID. Leaving that layout also
// creates a new client on the next login, including login as the same user.
export function AuthenticatedQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    return () => {
      // Cancels query retryers even when the transport ignores AbortSignal.
      // Late mutation callbacks retain this retired client, never the next one.
      queryClient.clear();
    };
  }, [queryClient]);

  useEffect(() => {
    const refreshSynchronizedInspection = (event: Event) => {
      const inspectionId = (event as CustomEvent<{ inspectionId: string }>).detail.inspectionId;
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: inspectionQueryKeys.detail(inspectionId) }),
        queryClient.invalidateQueries({
          queryKey: inspectionResponseQueryKeys.list(inspectionId),
        }),
        queryClient.invalidateQueries({ queryKey: inspectionQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: nonConformityQueryKeys.lists() }),
      ]);
    };

    window.addEventListener("safe-watch-offline-synchronized", refreshSynchronizedInspection);
    return () =>
      window.removeEventListener("safe-watch-offline-synchronized", refreshSynchronizedInspection);
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
