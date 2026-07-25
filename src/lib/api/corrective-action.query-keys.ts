export const correctiveActionQueryKeys = {
  all: ["corrective-actions"] as const,
  lists: () => [...correctiveActionQueryKeys.all, "list"] as const,
  list: (nonConformityId: string) =>
    [...correctiveActionQueryKeys.lists(), nonConformityId] as const,
};
