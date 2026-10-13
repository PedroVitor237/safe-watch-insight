import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { getAppSession } from "@/offline/session";
import { AuthenticatedQueryProvider } from "@/components/auth/AuthenticatedQueryProvider";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const result = await getAppSession();

    if (!result.success) {
      throw redirect({ to: "/login" });
    }

    return { userId: result.data.id };
  },
  component: AuthenticatedApp,
});

function AuthenticatedApp() {
  const { userId } = Route.useRouteContext();

  return (
    <AuthenticatedQueryProvider key={userId}>
      <AppShell />
    </AuthenticatedQueryProvider>
  );
}
