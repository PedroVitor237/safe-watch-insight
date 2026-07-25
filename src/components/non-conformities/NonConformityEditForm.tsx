import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateNonConformity } from "@/hooks/useNonConformities";

const formSchema = z.object({
  description: z.string().trim().min(1, "Informe a descrição.").max(2000),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  dueDate: z.string(),
});

type FormState = z.infer<typeof formSchema>;

export interface NonConformityEditFormProps {
  id: string;
  description: string;
  severity: FormState["severity"];
  dueDate: Date | string | null;
}

export function NonConformityEditForm({
  id,
  description,
  severity,
  dueDate,
}: NonConformityEditFormProps) {
  const updateNonConformity = useUpdateNonConformity();
  const form = useForm<FormState>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description,
      severity,
      dueDate: toDateInputValue(dueDate),
    },
  });

  useEffect(() => {
    form.reset({
      description,
      severity,
      dueDate: toDateInputValue(dueDate),
    });
  }, [description, dueDate, form, severity]);

  async function handleSubmit(values: FormState) {
    const result = await updateNonConformity.mutateAsync({
      id,
      data: {
        description: values.description,
        severity: values.severity,
        dueDate: values.dueDate
          ? new Date(`${values.dueDate}T12:00:00.000Z`)
          : null,
      },
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Não conformidade atualizada.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Descrição e classificação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nc-description">Descrição</Label>
            <Textarea
              id="nc-description"
              rows={5}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nc-severity">Severidade</Label>
              <Controller
                name="severity"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="nc-severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baixa</SelectItem>
                      <SelectItem value="MEDIUM">Média</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="CRITICAL">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nc-due-date">Prazo</Label>
              <Input
                id="nc-due-date"
                type="date"
                {...form.register("dueDate")}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={updateNonConformity.isPending}>
              <Save className="h-4 w-4" />
              Salvar alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function toDateInputValue(value: Date | string | null): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}
