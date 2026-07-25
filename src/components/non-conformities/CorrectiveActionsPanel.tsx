import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { CorrectiveAction } from "@/generated/prisma/client";
import {
  useCreateCorrectiveAction,
  useCorrectiveActions,
  useDeleteCorrectiveAction,
  useUpdateCorrectiveAction,
} from "@/hooks/useCorrectiveActions";
import { fmtData } from "@/lib/format";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type CorrectiveActionStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "OVERDUE";

const formSchema = z.object({
  description: z.string().trim().min(1, "Informe a descrição.").max(2000),
  why: z.string().trim().max(2000),
  location: z.string().trim().max(255),
  responsible: z.string().trim().max(255),
  dueDate: z.string(),
  method: z.string().trim().max(2000),
  estimatedCost: z.string().trim().max(255),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE"]),
});

type FormState = z.infer<typeof formSchema>;

const emptyForm: FormState = {
  description: "",
  why: "",
  location: "",
  responsible: "",
  dueDate: "",
  method: "",
  estimatedCost: "",
  status: "PENDING",
};

export interface CorrectiveActionsPanelProps {
  nonConformityId: string;
  initialActions: CorrectiveAction[];
}

export function CorrectiveActionsPanel({
  nonConformityId,
  initialActions,
}: CorrectiveActionsPanelProps) {
  const actionsQuery = useCorrectiveActions(nonConformityId);
  const createAction = useCreateCorrectiveAction();
  const updateAction = useUpdateCorrectiveAction();
  const deleteAction = useDeleteCorrectiveAction();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const form = useForm<FormState>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyForm,
  });
  const result = actionsQuery.data;
  const actions = result?.success ? result.data : initialActions;

  function openCreateDialog() {
    setEditingActionId(null);
    form.reset(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(action: CorrectiveAction) {
    setEditingActionId(action.id);
    form.reset({
      description: action.description,
      why: action.why ?? "",
      location: action.location ?? "",
      responsible: action.responsible ?? "",
      dueDate: toDateInputValue(action.dueDate),
      method: action.method ?? "",
      estimatedCost: action.estimatedCost ?? "",
      status: action.status,
    });
    setDialogOpen(true);
  }

  async function saveAction(values: FormState) {
    const data = {
      description: values.description,
      why: values.why || null,
      location: values.location || null,
      responsible: values.responsible || null,
      dueDate: values.dueDate
        ? new Date(`${values.dueDate}T12:00:00.000Z`)
        : null,
      method: values.method || null,
      estimatedCost: values.estimatedCost || null,
      status: values.status,
    };
    const saveResult = editingActionId
      ? await updateAction.mutateAsync({
          id: editingActionId,
          nonConformityId,
          data,
        })
      : await createAction.mutateAsync({
          nonConformityId,
          ...data,
        });

    if (!saveResult.success) {
      toast.error(saveResult.message);
      return;
    }

    toast.success(
      editingActionId
        ? "Ação corretiva atualizada."
        : "Ação corretiva cadastrada.",
    );
    setDialogOpen(false);
  }

  async function removeAction(id: string) {
    if (!window.confirm("Excluir esta ação corretiva?")) {
      return;
    }

    const deleteResult = await deleteAction.mutateAsync({
      id,
      nonConformityId,
    });

    if (!deleteResult.success) {
      toast.error(deleteResult.message);
      return;
    }

    toast.success("Ação corretiva excluída.");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Plano de ação 5W2H</CardTitle>
            <Button size="sm" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Nova ação
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {actionsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Carregando ações...</p>
          )}
          {result?.success === false && (
            <p className="text-sm text-destructive">{result.message}</p>
          )}
          {!actionsQuery.isLoading && actions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma ação corretiva cadastrada.
            </p>
          )}
          {actions.map((action) => (
            <CorrectiveActionCard
              key={action.id}
              action={action}
              onEdit={() => openEditDialog(action)}
              onDelete={() => removeAction(action.id)}
            />
          ))}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingActionId ? "Editar ação corretiva" : "Nova ação corretiva"}
            </DialogTitle>
            <DialogDescription>
              Preencha o plano 5W2H e acompanhe seu andamento.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(saveAction)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField form={form} name="description" label="O quê?" />
              <TextField form={form} name="why" label="Por quê?" />
              <TextField form={form} name="location" label="Onde?" />
              <TextField form={form} name="responsible" label="Quem?" />
              <TextField form={form} name="dueDate" label="Quando?" type="date" />
              <TextField
                form={form}
                name="estimatedCost"
                label="Quanto?"
                placeholder="Ex.: R$ 1.500,00"
              />
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="action-method">Como?</Label>
                <Textarea
                  id="action-method"
                  rows={4}
                  {...form.register("method")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="action-status">Status</Label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="action-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                      <SelectItem value="COMPLETED">Concluída</SelectItem>
                      <SelectItem value="OVERDUE">Vencida</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createAction.isPending || updateAction.isPending}
              >
                {editingActionId ? "Salvar alterações" : "Cadastrar ação"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CorrectiveActionCard({
  action,
  onEdit,
  onDelete,
}: {
  action: CorrectiveAction;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{action.description}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Responsável: {action.responsible ?? "Não definido"}</span>
            <span>Prazo: {fmtData(action.dueDate)}</span>
            {action.completedAt && (
              <span>Concluída em {fmtData(action.completedAt)}</span>
            )}
          </div>
        </div>
        <Badge variant={statusVariant(action.status)}>
          {statusLabel(action.status)}
        </Badge>
      </div>
      {(action.why ||
        action.location ||
        action.method ||
        action.estimatedCost) && (
        <dl className="mt-3 grid gap-2 rounded-md bg-muted/40 p-3 text-xs sm:grid-cols-2">
          <PlanDetail label="Por quê?" value={action.why} />
          <PlanDetail label="Onde?" value={action.location} />
          <PlanDetail label="Como?" value={action.method} />
          <PlanDetail label="Quanto?" value={action.estimatedCost} />
        </dl>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
          Excluir
        </Button>
      </div>
    </div>
  );
}

function TextField({
  form,
  name,
  label,
  type = "text",
  placeholder,
}: {
  form: ReturnType<typeof useForm<FormState>>;
  name:
    | "description"
    | "why"
    | "location"
    | "responsible"
    | "dueDate"
    | "estimatedCost";
  label: string;
  type?: string;
  placeholder?: string;
}) {
  const fieldId = `action-${name}`;
  const error = form.formState.errors[name];

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        type={type}
        placeholder={placeholder}
        {...form.register(name)}
      />
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}

function PlanDetail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <dt className="font-medium">{label}</dt>
      <dd className="text-muted-foreground">{value}</dd>
    </div>
  );
}

function toDateInputValue(value: Date | string | null): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function statusLabel(status: CorrectiveActionStatus): string {
  return {
    PENDING: "Pendente",
    IN_PROGRESS: "Em andamento",
    COMPLETED: "Concluída",
    OVERDUE: "Vencida",
  }[status];
}

function statusVariant(
  status: CorrectiveActionStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "COMPLETED") {
    return "default";
  }

  if (status === "OVERDUE") {
    return "destructive";
  }

  return status === "IN_PROGRESS" ? "secondary" : "outline";
}
