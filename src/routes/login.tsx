import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession, login } from "@/lib/api/auth.functions";
import { toast } from "sonner";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — SST Inspeções" }] }),
  beforeLoad: async () => {
    const result = await getCurrentSession();

    if (result.success) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    console.info("[login.form] payload sent to Server Function:", payload);

    setIsSubmitting(true);

    try {
      const result = await login({
        data: payload,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(`Bem-vindo(a), ${result.data.name.split(" ")[0]}!`);
      navigate({ to: "/dashboard" });
    } catch (error) {
      console.error("[login.form] Server Function error:", error);
      toast.error(error instanceof Error ? error.message : "Não foi possível realizar o login.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold">
            S
          </div>
          <span className="font-semibold">SST Inspeções</span>
        </div>
        <div>
          <ShieldCheck className="mb-4 h-10 w-10 text-sidebar-primary" />
          <h2 className="text-3xl font-bold leading-tight">
            Inspeções, auditorias e fiscalizações de Segurança e Saúde no Trabalho
            <span className="text-sidebar-primary"> em um só lugar.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm text-sidebar-foreground/70">
            Execução de checklists em campo, registro de não conformidades, planos de ação 5W2H e
            relatórios — com suporte offline.
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
              Use suas credenciais cadastradas para acessar a plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <div className="mt-4 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
              <div className="font-medium text-foreground">Ambiente de demonstração</div>
              <div className="mt-2 space-y-1">
                <div>
                  Email: <span className="font-medium text-foreground">admin@demo.com</span>
                </div>
                <div>
                  Senha: <span className="font-medium text-foreground">Admin@123</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
