import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ListChecks, Pencil, Trash2 } from "lucide-react";
import {
  useChecklists,
  useCreateChecklist,
  useDeleteChecklist,
  useUpdateChecklist,
} from "@/hooks/useChecklists";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/checklists/")({
  head: () => ({ meta: [{ title: "Checklists — SST" }] }),
  component: ListaChecklists,
});

function ListaChecklists() {
  const {
    data: checklistsResult,
    isError,
    isLoading,
  } = useChecklists({
    isActive: true,
  });
  const createChecklist = useCreateChecklist();
  const updateChecklist = useUpdateChecklist();
  const deleteChecklist = useDeleteChecklist();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [form, setForm] = useState<ChecklistFormState>(emptyChecklistForm);
  const checklists = checklistsResult?.success ? checklistsResult.data.items : [];
  const errorMessage =
    checklistsResult && !checklistsResult.success
      ? checklistsResult.message
      : "Não foi possível carregar os checklists.";

  function openCreateDialog() {
    setEditingChecklistId(null);
    setForm(emptyChecklistForm);
    setDialogOpen(true);
  }

  function openEditDialog(checklist: (typeof checklists)[number]) {
    setEditingChecklistId(checklist.id);
    setForm({
      title: checklist.title,
      description: checklist.description ?? "",
      isTemplate: checklist.isTemplate,
      isActive: checklist.isActive,
    });
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = editingChecklistId
      ? await updateChecklist.mutateAsync({ id: editingChecklistId, data: form })
      : await createChecklist.mutateAsync(form);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(editingChecklistId ? "Checklist atualizado." : "Checklist cadastrado.");
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este checklist?")) {
      return;
    }

    const result = await deleteChecklist.mutateAsync(id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Checklist excluído.");
  }

  return (
    <div>
      <PageHeader
        title="Biblioteca de checklists"
        description="Modelos de checklist por norma regulamentadora."
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Novo modelo
          </Button>
        }
      />
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div className="h-5 w-20 rounded bg-muted" />
                </div>
                <div className="mt-3 h-4 w-44 rounded bg-muted" />
                <div className="mt-2 h-3 w-32 rounded bg-muted" />
                <div className="mt-4 h-10 w-full rounded bg-muted" />
              </CardContent>
            </Card>
          ))}

        {(isError || (checklistsResult && !checklistsResult.success)) && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="p-5 text-sm text-muted-foreground">{errorMessage}</CardContent>
          </Card>
        )}

        {!isLoading && !isError && checklistsResult?.success && checklists.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="p-5 text-sm text-muted-foreground">
              Nenhum checklist cadastrado.
            </CardContent>
          </Card>
        )}

        {checklists.map((c) => (
          <Card key={c.id} className="h-full transition hover:border-primary hover:shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <Badge variant="outline">{c.isTemplate ? "Template" : "Personalizado"}</Badge>
                </div>
                <div className="mt-3 font-semibold">{c.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {c.isActive ? "Ativo" : "Inativo"}
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {c.description ?? "Sem descrição cadastrada."}
                </p>
                <div className="mt-4 flex gap-3 text-xs text-muted-foreground">
                  <span>{c.items.length} itens cadastrados</span>
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/checklists/$id" params={{ id: c.id }}>
                      Abrir
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(c)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingChecklistId ? "Editar checklist" : "Novo checklist"}</DialogTitle>
            <DialogDescription>Defina o modelo que será usado nas inspeções.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="checklist-title">Título</Label>
              <Input
                id="checklist-title"
                value={form.title}
                required
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checklist-description">Descrição</Label>
              <Textarea
                id="checklist-description"
                value={form.description}
                rows={3}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="checklist-template">Template oficial</Label>
              <Switch
                id="checklist-template"
                checked={form.isTemplate}
                onCheckedChange={(checked) => setForm({ ...form, isTemplate: checked })}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="checklist-active">Ativo</Label>
              <Switch
                id="checklist-active"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createChecklist.isPending || updateChecklist.isPending}>
                {editingChecklistId ? "Salvar alterações" : "Cadastrar checklist"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ChecklistFormState {
  title: string;
  description: string;
  isTemplate: boolean;
  isActive: boolean;
}

const emptyChecklistForm: ChecklistFormState = {
  title: "",
  description: "",
  isTemplate: false,
  isActive: true,
};
