import { createFileRoute } from "@tanstack/react-router";

// The worker reuses this identity-free document at the requested offline URL.
export const Route = createFileRoute("/offline-shell")({
  ssr: false,
  component: () => null,
});
