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
  WifiOff,
  RefreshCw,
  Bell,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { store, useStore } from "@/lib/mockStore";
import { getCurrentSession, logout } from "@/lib/api/auth.functions";
import { toast } from "sonner";

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
    await logout();
    navigate({ to: "/login" });
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
  const { offline, pendingSync } = useStore((s) => s);
  const navigate = useNavigate();
  const { data: sessionResult } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getCurrentSession(),
  });
  const user = sessionResult?.success ? sessionResult.data : null;
  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("") ?? "SW";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-3 backdrop-blur sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center gap-2 min-w-0">
        {offline && (
          <Badge
            variant="outline"
            className="gap-1 border-warning text-warning-foreground bg-warning/15"
          >
            <WifiOff className="h-3 w-3" /> Offline
          </Badge>
        )}
        {pendingSync > 0 && (
          <Badge variant="outline" className="gap-1 border-info text-info bg-info/10">
            <RefreshCw className="h-3 w-3" />
            {pendingSync} pendente(s)
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs text-muted-foreground">Offline</span>
          <Switch
            checked={offline}
            onCheckedChange={(v) => {
              store.setOffline(v);
              if (!v && pendingSync > 0) {
                store.sync();
                toast.success("Sincronização concluída");
              }
            }}
          />
        </div>
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
  const offline = useStore((s) => s.offline);
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopBar />
          {offline && (
            <div className="border-b border-warning/30 bg-warning/10 px-4 py-2 text-xs text-foreground">
              Você está em <strong>modo offline</strong>. As alterações ficarão em fila e serão
              sincronizadas automaticamente ao voltar a conexão.
            </div>
          )}
          <main className="flex-1 bg-muted/30">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
