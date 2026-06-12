import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { store } from "@/lib/mockStore";
import type { PerfilUsuario } from "@/types/sst";
import { usuarios } from "@/mocks/data";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — SST Inspeções" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("ana.lima@sstapp.com.br");
  const [senha, setSenha] = useState("demo1234");
  const [perfil, setPerfil] = useState<PerfilUsuario>("inspetor");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const u = usuarios.find((x) => x.email === email) ?? usuarios[0];
    store.setUsuario(u.id);
    store.setPerfil(perfil);
    toast.success(`Bem-vindo(a), ${u.nome.split(" ")[0]}!`);
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold">S</div>
          <span className="font-semibold">SST Inspeções</span>
        </div>
        <div>
          <ShieldCheck className="mb-4 h-10 w-10 text-sidebar-primary" />
          <h2 className="text-3xl font-bold leading-tight">
            Inspeções, auditorias e fiscalizações de Segurança e Saúde no Trabalho
            <span className="text-sidebar-primary"> em um só lugar.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm text-sidebar-foreground/70">
            Execução de checklists em campo, registro de não conformidades,
            planos de ação 5W2H e relatórios — com suporte offline.
          </p>
        </div>
        <div className="text-xs text-sidebar-foreground/50">
          © 2026 SST Inspeções · Protótipo acadêmico
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Entrar na plataforma</CardTitle>
            <CardDescription>
              Protótipo: qualquer credencial é aceita. Escolha um perfil para simular permissões.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Perfil</Label>
                <RadioGroup
                  value={perfil}
                  onValueChange={(v) => setPerfil(v as PerfilUsuario)}
                  className="grid grid-cols-3 gap-2"
                >
                  {(["inspetor", "gestor", "auditor"] as PerfilUsuario[]).map((p) => (
                    <label
                      key={p}
                      htmlFor={`p-${p}`}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 py-2 text-sm capitalize hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10"
                    >
                      <RadioGroupItem id={`p-${p}`} value={p} />
                      {p}
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <Button type="submit" className="w-full">Entrar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
