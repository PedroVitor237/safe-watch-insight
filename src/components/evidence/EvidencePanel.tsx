import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, ImageIcon, Loader2, Paperclip, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEvidence, useRemoveEvidence, useUploadEvidence } from "@/hooks/useEvidence";
import { MAX_EVIDENCE_FILE_SIZE, SUPPORTED_EVIDENCE_MIME_TYPES } from "@/lib/evidence";
import type { EvidenceTargetSchemaInput } from "@/server/schemas/evidence.schema";
import { useOfflineState } from "@/offline/use-offline-state";

export interface EvidencePanelProps {
  target: EvidenceTargetSchemaInput;
  title?: string;
}

interface SelectedFilePreview {
  file: File;
  url: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateSelectedFile(file: File): string | null {
  if (
    !SUPPORTED_EVIDENCE_MIME_TYPES.includes(
      file.type as (typeof SUPPORTED_EVIDENCE_MIME_TYPES)[number],
    )
  ) {
    return `${file.name}: formato não suportado. Use JPEG, PNG ou WebP.`;
  }

  if (file.size <= 0 || file.size > MAX_EVIDENCE_FILE_SIZE) {
    return `${file.name}: a imagem deve possuir no máximo 4 MB.`;
  }

  return null;
}

export function EvidencePanel({ target, title = "Evidências" }: EvidencePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const offlineState = useOfflineState();
  const evidenceQuery = useEvidence(target, { enabled: offlineState.isOnline });
  const uploadEvidence = useUploadEvidence(target);
  const removeEvidence = useRemoveEvidence(target);
  const result = evidenceQuery.data;
  const evidence = result?.success ? result.data : [];
  const previews = useMemo<SelectedFilePreview[]>(
    () => selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [selectedFiles],
  );

  useEffect(
    () => () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    },
    [previews],
  );

  function selectFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    const validFiles: File[] = [];

    Array.from(files).forEach((file) => {
      const validationMessage = validateSelectedFile(file);

      if (validationMessage) {
        toast.error(validationMessage);
      } else {
        validFiles.push(file);
      }
    });

    setSelectedFiles(validFiles);
  }

  function clearSelectedFile(file: File) {
    setSelectedFiles((current) => current.filter((selectedFile) => selectedFile !== file));
  }

  async function uploadSelectedFiles() {
    if (selectedFiles.length === 0) {
      toast.error("Selecione pelo menos uma imagem.");
      return;
    }

    setIsUploading(true);
    let uploadCount = 0;

    try {
      for (const file of selectedFiles) {
        const uploadResult = await uploadEvidence.mutateAsync({ target, file, caption });

        if (!uploadResult.success) {
          toast.error(uploadResult.message);
          continue;
        }

        uploadCount += 1;
        clearSelectedFile(file);
      }

      if (uploadCount > 0) {
        toast.success(
          uploadCount === 1
            ? "Evidência enviada com sucesso."
            : `${uploadCount} evidências enviadas com sucesso.`,
        );
      }

      if (uploadCount === selectedFiles.length) {
        setCaption("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch {
      toast.error("Não foi possível enviar a evidência. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Remover esta evidência? O registro será arquivado.")) {
      return;
    }

    try {
      const removeResult = await removeEvidence.mutateAsync(id);

      if (!removeResult.success) {
        toast.error(removeResult.message);
        return;
      }

      toast.success("Evidência removida.");
    } catch {
      toast.error("Não foi possível remover a evidência. Tente novamente.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {!offlineState.isOnline && (
          <Alert>
            <AlertTitle>Upload de evidências indisponível offline</AlertTitle>
            <AlertDescription>
              As respostas continuam salvas no dispositivo. A fila persistente de arquivos ainda não
              faz parte deste incremento; selecione e envie as imagens após reconectar.
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <div className="space-y-1">
            <Label htmlFor={`evidence-file-${target.inspectionId ?? target.nonConformityId}`}>
              Imagens
            </Label>
            <Input
              ref={fileInputRef}
              id={`evidence-file-${target.inspectionId ?? target.nonConformityId}`}
              type="file"
              accept={SUPPORTED_EVIDENCE_MIME_TYPES.join(",")}
              multiple
              disabled={isUploading || !offlineState.isOnline}
              onChange={(event) => selectFiles(event.target.files)}
            />
            <p className="text-xs text-muted-foreground">JPEG, PNG ou WebP, até 4 MB por imagem.</p>
          </div>

          {previews.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {previews.map(({ file, url }) => (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="overflow-hidden rounded-md border bg-muted/20"
                >
                  <img
                    src={url}
                    alt={`Prévia de ${file.name}`}
                    className="h-32 w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-2 p-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover ${file.name} da seleção`}
                      disabled={isUploading}
                      onClick={() => clearSelectedFile(file)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor={`evidence-caption-${target.inspectionId ?? target.nonConformityId}`}>
              Legenda opcional
            </Label>
            <Textarea
              id={`evidence-caption-${target.inspectionId ?? target.nonConformityId}`}
              value={caption}
              maxLength={500}
              rows={2}
              disabled={isUploading || !offlineState.isOnline}
              placeholder="Descreva o local ou o contexto registrado."
              onChange={(event) => setCaption(event.target.value)}
            />
          </div>

          <Button
            type="button"
            disabled={selectedFiles.length === 0 || isUploading || !offlineState.isOnline}
            onClick={uploadSelectedFiles}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading ? "Enviando..." : "Enviar evidências"}
          </Button>
        </div>

        {offlineState.isOnline && evidenceQuery.isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando evidências...
          </div>
        )}

        {result?.success === false && (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível carregar as evidências</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{result.message}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => evidenceQuery.refetch()}
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!evidenceQuery.isLoading && result?.success && evidence.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">Nenhuma evidência registrada</p>
            <p className="text-xs text-muted-foreground">
              Selecione uma ou mais imagens para documentar este contexto histórico.
            </p>
          </div>
        )}

        {evidence.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {evidence.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-lg border">
                <a href={item.storageUrl} target="_blank" rel="noreferrer">
                  <img
                    src={item.storageUrl}
                    alt={item.caption ?? item.fileName}
                    className="h-40 w-full object-cover transition-opacity hover:opacity-90"
                    loading="lazy"
                  />
                </a>
                <div className="space-y-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.fileSize)}
                        {item.width && item.height ? ` · ${item.width}×${item.height}px` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0">
                      <Button asChild type="button" variant="ghost" size="icon">
                        <a
                          href={item.storageUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Abrir ${item.fileName}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover ${item.fileName}`}
                        disabled={removeEvidence.isPending}
                        onClick={() => remove(item.id)}
                      >
                        {removeEvidence.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {item.caption && <p className="text-xs text-muted-foreground">{item.caption}</p>}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Paperclip className="h-3 w-3" />
                    Evidência fotográfica
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
