import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ClipboardCheck,
  ListChecks,
  AlertTriangle,
  FileText,
  Building2,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/api/auth.functions";
import { toast } from "sonner";
import { OfflineStatusIndicator } from "@/components/offline/OfflineStatusIndicator";
import { clearAllOfflineData } from "@/offline/database";
import { getAppSession } from "@/offline/session";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inspecoes", label: "Inspeções", icon: ClipboardCheck },
  { to: "/checklists", label: "Checklists", icon: ListChecks },
  { to: "/nao-conformidades", label: "Não conformidades", icon: AlertTriangle },
  { to: "/relatorios", label: "Relatórios", icon: FileText },
];

const navAdmin = [
  { to: "/empresas", label: "Empresas", icon: Building2 },
  { to: "/normas", label: "Normas (NRs)", icon: BookOpen },
  { to: "/equipe", label: "Equipe", icon: Users },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { state } = useSidebar();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";
  const isActive = (p: string) => pathname === p || pathname.startsWith(p + "/");

  async function handleLogout() {
    let remoteLogoutSucceeded = false;
    let localDataCleared = false;

    try {
      const result = await logout();

      if (!result.success) {
        toast.warning("A sessão local foi encerrada, mas o servidor não confirmou o logout.");
      } else {
        remoteLogoutSucceeded = true;
      }
    } catch {
      toast.warning("Logout local concluído. A sessão remota expirará automaticamente.");
    } finally {
      try {
        await clearAllOfflineData();
        localDataCleared = true;
      } catch {
        toast.error(
          "A sessão foi encerrada, mas parte dos dados offline não pôde ser removida deste dispositivo.",
        );
      }

      if (remoteLogoutSucceeded && localDataCleared) {
        toast.success("Sessão encerrada e dados offline removidos deste dispositivo.");
      }
      navigate({ to: "/login" });
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold">
            S
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-sidebar-foreground">
                SST Inspeções
              </div>
              <div className="truncate text-[10px] text-sidebar-foreground/60">
                Plataforma de fiscalização
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={isActive(item.to)}>
                    <Link to={item.to} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Cadastros</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navAdmin.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={isActive(item.to)}>
                    <Link to={item.to} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function TopBar() {
  const navigate = useNavigate();
  const { data: sessionResult } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAppSession(),
    networkMode: "always",
  });
  const user = sessionResult?.success ? sessionResult.data : null;

  useEffect(() => {
    if (sessionResult?.success === false) {
      navigate({ to: "/login", replace: true });
    }
  }, [navigate, sessionResult]);
  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("") ?? "SW";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-3 backdrop-blur sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="min-w-0 flex-1" />

      <div className="flex items-center gap-3">
        <OfflineStatusIndicator />
        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell className="h-4 w-4" />
        </Button>
        <button
          className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
          onClick={() => navigate({ to: "/configuracoes" })}
        >
          <div
            className="grid h-8 w-8 place-items-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          >
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-xs font-medium leading-tight">{user?.name ?? "Usuário"}</div>
            <div className="text-[10px] capitalize text-muted-foreground">
              {user?.role.toLowerCase() ?? "autenticado"}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}

export function AppShell() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 bg-muted/30">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
