import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useChecklistItems,
  useCreateChecklistItem,
  useDeleteChecklistItem,
  useUpdateChecklistItem,
} from "@/hooks/useChecklistItems";
import { useChecklist } from "@/hooks/useChecklists";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/checklists/$id")({
  head: () => ({ meta: [{ title: "Editor de checklist — SST" }] }),
  component: EditorChecklist,
});

function EditorChecklist() {
  const { id } = Route.useParams();
  const { data: checklistResult, isError, isLoading } = useChecklist(id);
  const { data: itemsResult, isLoading: isLoadingItems } = useChecklistItems(id);
  const createItem = useCreateChecklistItem();
  const updateItem = useUpdateChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [form, setForm] = useState<ChecklistItemFormState>(emptyChecklistItemForm);
  const checklist = checklistResult?.success ? checklistResult.data : null;
  const items = itemsResult?.success ? itemsResult.data : checklist?.items ?? [];

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Carregando checklist...</div>;
  }

  if (isError || !checklistResult?.success || !checklist) {
    return <div className="p-8">Checklist não encontrado.</div>;
  }

  function openCreateDialog() {
    setEditingItemId(null);
    setForm(emptyChecklistItemForm);
    setDialogOpen(true);
  }

  function openEditDialog(item: (typeof items)[number]) {
    setEditingItemId(item.id);
    setForm({
      description: item.description,
      isRequired: item.isRequired,
    });
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = editingItemId
      ? await updateItem.mutateAsync({
          id: editingItemId,
          checklistId: id,
          data: form,
        })
      : await createItem.mutateAsync({
          checklistId: id,
          description: form.description,
          isRequired: form.isRequired,
        });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(editingItemId ? "Item atualizado." : "Item cadastrado.");
    setDialogOpen(false);
  }

  async function handleDelete(itemId: string) {
    if (!window.confirm("Excluir este item do checklist?")) {
      return;
    }

    const result = await deleteItem.mutateAsync({ id: itemId, checklistId: id });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Item excluído.");
  }

  return (
    <div>
      <PageHeader
        title={checklist.title}
        description={checklist.description ?? "Sem descrição cadastrada."}
        actions={
          <Button asChild variant="outline">
            <Link to="/checklists">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />
      <div className="space-y-4 p-4 sm:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do checklist</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="outline">{checklist.isTemplate ? "Template" : "Personalizado"}</Badge>
            <StatusBadge value={checklist.isActive ? "ativo" : "inativo"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Itens do checklist</CardTitle>
              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                Novo item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingItems && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Carregando itens...
              </div>
            )}

            {!isLoadingItems && items.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhum item cadastrado para este checklist.
              </div>
            )}

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-lg border p-4 md:grid-cols-[auto_minmax(0,1fr)_auto]"
                >
                  <Badge variant="secondary" className="h-fit">
                    {item.orderIndex}
                  </Badge>
                  <div className="min-w-0">
                    <div className="font-medium">{item.description}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.isRequired ? "Obrigatório" : "Opcional"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItemId ? "Editar item" : "Novo item"}</DialogTitle>
            <DialogDescription>Cadastre uma verificação objetiva para este checklist.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="checklist-item-description">Descrição</Label>
              <Textarea
                id="checklist-item-description"
                value={form.description}
                required
                rows={4}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="checklist-item-required">Obrigatório</Label>
              <Switch
                id="checklist-item-required"
                checked={form.isRequired}
                onCheckedChange={(checked) => setForm({ ...form, isRequired: checked })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
                {editingItemId ? "Salvar alterações" : "Cadastrar item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ChecklistItemFormState {
  description: string;
  isRequired: boolean;
}

const emptyChecklistItemForm: ChecklistItemFormState = {
  description: "",
  isRequired: true,
};
