export const reportQueryKeys = {
  all: ["reports"] as const,
  available: () => [...reportQueryKeys.all, "available"] as const,
  details: () => [...reportQueryKeys.all, "detail"] as const,
  detail: (inspectionId: string) => [...reportQueryKeys.details(), inspectionId] as const,
};
