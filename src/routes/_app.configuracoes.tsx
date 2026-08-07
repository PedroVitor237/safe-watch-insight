import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { store, useStore } from "@/lib/mockStore";
import {
  AlertTriangle,
  Database,
  Moon,
  RefreshCw,
  RotateCcw,
  Sun,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PerfilUsuario } from "@/types/sst";
import { useOfflineState } from "@/offline/use-offline-state";
import { retryOfflineQueue, synchronizeOfflineQueue } from "@/offline/sync-manager";

export const Route = createFileRoute("/_app/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — SST" }] }),
  component: Configuracoes,
});

function Configuracoes() {
  const perfil = useStore((s) => s.perfil);
  const [dark, setDark] = useState(false);
  const offlineState = useOfflineState();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Preferências locais, armazenamento no dispositivo e sincronização."
      />
      <div className="grid gap-4 p-4 sm:p-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aparência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center gap-2">
                  {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  Modo escuro
                </Label>
                <p className="text-xs text-muted-foreground">
                  Reduz brilho em ambientes industriais.
                </p>
              </div>
              <Switch checked={dark} onCheckedChange={setDark} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Perfil ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={perfil} onValueChange={(v) => store.setPerfil(v as PerfilUsuario)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inspetor">Inspetor</SelectItem>
                <SelectItem value="gestor">Gestor SST</SelectItem>
                <SelectItem value="auditor">Auditor</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs text-muted-foreground">
              Seleção demonstrativa usada apenas nas telas mockadas. Ela não altera o usuário
              autenticado nem as permissões aplicadas pelo servidor.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funcionamento offline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center gap-2">
                  {offlineState.isOnline ? (
                    <Wifi className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-amber-600" />
                  )}
                  {offlineState.isOnline ? "Conexão disponível" : "Sem conexão"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  Estado obtido do navegador; o resultado de cada envio ainda é validado pelo
                  servidor.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md border bg-muted/40 p-3">
                <Database className="mb-1 h-4 w-4" />
                <strong>{offlineState.storedInspections}</strong>
                <p className="text-xs text-muted-foreground">inspeção(ões) no dispositivo</p>
              </div>
              <div className="rounded-md border bg-muted/40 p-3">
                <RefreshCw className="mb-1 h-4 w-4" />
                <strong>{offlineState.pending + offlineState.syncing}</strong>
                <p className="text-xs text-muted-foreground">operação(ões) pendente(s)</p>
              </div>
            </div>
            {(offlineState.failed > 0 || offlineState.conflicts > 0) && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                <div className="flex items-center gap-2 font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Sincronização bloqueada
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {offlineState.conflicts > 0
                    ? `${offlineState.conflicts} conflito(s) exigem revisão; nenhuma sobrescrita automática foi aplicada.`
                    : `${offlineState.failed} operação(ões) falharam e podem ser reenviadas.`}
                </p>
              </div>
            )}
            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
              Respostas e encerramento usam o snapshot histórico armazenado em IndexedDB. “Pendente”
              não significa sincronizado com o PostgreSQL.
              <Button
                size="sm"
                className="mt-3 w-full"
                disabled={
                  !offlineState.isOnline ||
                  offlineState.syncing > 0 ||
                  (offlineState.pending === 0 && offlineState.failed === 0)
                }
                onClick={() =>
                  void (offlineState.failed > 0 ? retryOfflineQueue() : synchronizeOfflineQueue())
                }
              >
                <RefreshCw
                  className={`h-4 w-4 ${offlineState.syncing > 0 ? "animate-spin" : ""}`}
                />
                {offlineState.syncing > 0 ? "Sincronizando..." : "Sincronizar agora"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do protótipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Limpa apenas os dados demonstrativos locais usados por dashboard, relatórios e equipe.
              Não altera empresas, checklists ou inspeções persistidos no banco.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                store.reset();
                toast.success("Dados demonstrativos restaurados");
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar dados demonstrativos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
