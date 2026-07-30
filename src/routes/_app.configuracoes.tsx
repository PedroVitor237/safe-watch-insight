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
import { Moon, RotateCcw, Sun, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PerfilUsuario } from "@/types/sst";

export const Route = createFileRoute("/_app/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — SST" }] }),
  component: Configuracoes,
});

function Configuracoes() {
  const perfil = useStore((s) => s.perfil);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Preferências locais e recursos planejados da plataforma."
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
                  <WifiOff className="h-4 w-4" />
                  Modo offline
                </Label>
                <p className="text-xs text-muted-foreground">
                  Em desenvolvimento. As operações atuais exigem conexão e só são confirmadas após
                  persistência no servidor.
                </p>
              </div>
              <Switch checked={false} disabled aria-label="Modo offline ainda não disponível" />
            </div>
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <p className="text-muted-foreground">
                A fila de sincronização com IndexedDB/Dexie será implementada em um sprint futuro.
                Nenhum dado é marcado como sincronizado por esta tela.
              </p>
              <Button size="sm" className="mt-3 w-full" disabled>
                Sincronização ainda não disponível
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
