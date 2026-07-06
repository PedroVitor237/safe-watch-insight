import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentSession } from "@/lib/api/auth.functions";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const result = await getCurrentSession();

    if (!result.success) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppShell,
});
