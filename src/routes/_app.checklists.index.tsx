import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
  useDeriveOfficialTemplate,
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
  const navigate = useNavigate();
  const deriveTemplate = useDeriveOfficialTemplate();
  const [scope, setScope] = useState<"official" | "mine" | "shared">("official");
  const [page, setPage] = useState(1);
  const {
    data: checklistsResult,
    isError,
    isLoading,
  } = useChecklists({
    isActive: true,
    scope,
    page,
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

  async function handleUseTemplate(id: string) {
    try {
      const result = await deriveTemplate.mutateAsync(id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Cópia pessoal criada. Revise os itens e publique sua versão.");
      await navigate({ to: "/checklists/$id", params: { id: result.data.id } });
    } catch {
      toast.error("Não foi possível usar o template. Tente novamente.");
    }
  }

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

    try {
      const result = editingChecklistId
        ? await updateChecklist.mutateAsync({ id: editingChecklistId, data: form })
        : await createChecklist.mutateAsync(form);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(editingChecklistId ? "Checklist atualizado." : "Checklist cadastrado.");
      setDialogOpen(false);
      setScope("mine");
      setPage(1);
    } catch {
      toast.error("Não foi possível salvar o checklist. Verifique os dados e tente novamente.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este checklist?")) {
      return;
    }

    try {
      const result = await deleteChecklist.mutateAsync(id);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Checklist excluído.");
    } catch {
      toast.error("Não foi possível excluir o checklist. Tente novamente.");
    }
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
      <div className="flex flex-wrap gap-2 px-4 pt-4 sm:px-8" aria-label="Catálogos de checklist">
        {(
          [
            ["official", "Templates oficiais"],
            ["mine", "Meus checklists"],
            ["shared", "Publicados por usuários"],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            variant={scope === value ? "default" : "outline"}
            aria-pressed={scope === value}
            onClick={() => {
              setScope(value);
              setPage(1);
            }}
          >
            {label}
          </Button>
        ))}
      </div>
      {scope === "official" && (
        <p className="px-4 pt-3 text-sm text-muted-foreground sm:px-8">
          Templates oficiais da Safe Watch Insight. Não são documentos governamentais. Use um
          template para criar sua cópia editável.
        </p>
      )}
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
                <div className="flex flex-wrap justify-end gap-1">
                  <Badge variant="outline">
                    {c.isOfficial
                      ? "Oficial · Safe Watch Insight"
                      : c.isTemplate
                        ? "Template pessoal"
                        : "Personalizado"}
                  </Badge>
                  <ChecklistVersionBadge versions={c.versions} />
                </div>
              </div>
              <div className="mt-3 font-semibold">{c.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {c.isActive ? "Ativo" : "Inativo"}
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                {c.description ?? "Sem descrição cadastrada."}
              </p>
              <div className="mt-4 flex gap-3 text-xs text-muted-foreground">
                <span>{getWorkingItemCount(c.versions)} itens cadastrados</span>
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/checklists/$id" params={{ id: c.id }}>
                    Abrir
                  </Link>
                </Button>
                {c.isOfficial && (
                  <Button
                    size="sm"
                    disabled={deriveTemplate.isPending}
                    onClick={() => handleUseTemplate(c.id)}
                  >
                    Usar template
                  </Button>
                )}
                {c.canManage && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(c)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {checklistsResult?.success && checklistsResult.data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pb-4">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <span className="text-sm">
            Página {page} de {checklistsResult.data.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= checklistsResult.data.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
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
              <Label htmlFor="checklist-template">Template pessoal</Label>
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
              <Button
                type="submit"
                disabled={createChecklist.isPending || updateChecklist.isPending}
              >
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

function ChecklistVersionBadge({
  versions,
}: {
  versions: Array<{ versionNumber: number; status: string }>;
}) {
  const draft = versions.find((version) => version.status === "DRAFT");
  const published = versions.find((version) => version.status === "PUBLISHED");

  if (draft) {
    return <Badge variant="secondary">Rascunho v{draft.versionNumber}</Badge>;
  }

  if (published) {
    return <Badge variant="secondary">Publicada v{published.versionNumber}</Badge>;
  }

  return <Badge variant="secondary">Sem versão publicada</Badge>;
}

function getWorkingItemCount(
  versions: Array<{ status: string; _count: { items: number } }>,
): number {
  const workingVersion =
    versions.find((version) => version.status === "DRAFT") ??
    versions.find((version) => version.status === "PUBLISHED") ??
    versions[0];

  return workingVersion?._count.items ?? 0;
}
