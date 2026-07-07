export const checklistItemQueryKeys = {
  all: ["checklist-items"] as const,
  lists: () => [...checklistItemQueryKeys.all, "list"] as const,
  list: (checklistId: string) => [...checklistItemQueryKeys.lists(), checklistId] as const,
};
