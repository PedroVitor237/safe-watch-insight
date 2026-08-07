import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { getAppSession } from "@/offline/session";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const result = await getAppSession();

    if (!result.success) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppShell,
});
