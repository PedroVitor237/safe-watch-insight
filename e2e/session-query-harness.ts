import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { AuthenticatedQueryProvider } from "../src/components/auth/AuthenticatedQueryProvider";

export { isCancelledError } from "@tanstack/react-query";

// Browser-only test harness; never imported by the application.
export const publicClient = new QueryClient();
const container = document.createElement("div");
document.body.append(container);
const root = createRoot(container);
let currentClient: QueryClient;

function Probe() {
  currentClient = useQueryClient();
  return null;
}

export function mount(identity: string | null): QueryClient {
  flushSync(() => {
    root.render(
      createElement(
        QueryClientProvider,
        { client: publicClient },
        identity !== null
          ? createElement(AuthenticatedQueryProvider, {
              key: identity,
              children: createElement(Probe),
            })
          : null,
      ),
    );
  });
  return currentClient;
}

export function unmount() {
  flushSync(() => root.unmount());
}
