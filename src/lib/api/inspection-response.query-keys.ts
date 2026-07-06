export const inspectionResponseQueryKeys = {
  all: ["inspection-responses"] as const,
  lists: () => [...inspectionResponseQueryKeys.all, "list"] as const,
  list: (inspectionId: string) => [...inspectionResponseQueryKeys.lists(), inspectionId] as const,
};
