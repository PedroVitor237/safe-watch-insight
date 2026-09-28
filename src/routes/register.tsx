import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register as registerUser } from "@/lib/api/auth.functions";
import {
  registrationSchema,
  type RegistrationSchemaInput,
} from "@/lib/validation/registration.schema";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Criar conta — SST Inspeções" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const form = useForm<RegistrationSchemaInput>({ resolver: zodResolver(registrationSchema) });
  const mutation = useMutation({
    mutationFn: (input: RegistrationSchemaInput) => registerUser({ data: input }),
  });

  async function handleSubmit(input: RegistrationSchemaInput) {
    try {
      const result = await mutation.mutateAsync(input);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Conta criada. Entre com seu e-mail e senha.");
      await navigate({ to: "/login" });
    } catch {
      toast.error("Não foi possível criar a conta. Tente novamente.");
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
            Crie sua conta para registrar empresas, executar inspeções e acompanhar ações
            corretivas.
          </p>
        </div>
        <div className="text-xs text-sidebar-foreground/50">
          © 2026 SST Inspeções · Protótipo acadêmico
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>Informe seus dados para acessar a plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              method="post"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  aria-invalid={!!form.formState.errors.name}
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!form.formState.errors.email}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!form.formState.errors.password}
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Use pelo menos 8 caracteres.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!form.formState.errors.confirmPassword}
                  {...form.register("confirmPassword")}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
