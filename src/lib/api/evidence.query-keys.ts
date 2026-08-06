import type { EvidenceTargetSchemaInput } from "@/server/schemas/evidence.schema";

export const evidenceQueryKeys = {
  all: ["evidence"] as const,
  lists: () => [...evidenceQueryKeys.all, "list"] as const,
  list: (target: EvidenceTargetSchemaInput) => [...evidenceQueryKeys.lists(), target] as const,
};
