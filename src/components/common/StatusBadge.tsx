import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { labelStatus } from "@/lib/format";

const styles: Record<string, string> = {
  planejada: "bg-info/15 text-info border-info/40",
  em_andamento: "bg-warning/20 text-warning-foreground border-warning/50",
  concluida: "bg-success/15 text-success border-success/40",
  pendente_sync: "bg-muted text-muted-foreground border-border",
  aberta: "bg-destructive/15 text-destructive border-destructive/40",
  em_tratativa: "bg-warning/20 text-warning-foreground border-warning/50",
  resolvida: "bg-success/15 text-success border-success/40",
  vencida: "bg-destructive/25 text-destructive border-destructive/60",
  conforme: "bg-success/15 text-success border-success/40",
  nao_conforme: "bg-destructive/15 text-destructive border-destructive/40",
  na: "bg-muted text-muted-foreground border-border",
  baixa: "bg-muted text-muted-foreground border-border",
  media: "bg-info/15 text-info border-info/40",
  alta: "bg-warning/20 text-warning-foreground border-warning/50",
  critica: "bg-destructive/20 text-destructive border-destructive/50",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium capitalize", styles[value] ?? "", className)}
    >
      {labelStatus[value] ?? value}
    </Badge>
  );
}
