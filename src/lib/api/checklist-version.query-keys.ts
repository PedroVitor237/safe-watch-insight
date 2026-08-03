export const checklistVersionQueryKeys = {
  all: ["checklist-versions"] as const,
  lists: () => [...checklistVersionQueryKeys.all, "list"] as const,
  list: (checklistId: string) => [...checklistVersionQueryKeys.lists(), checklistId] as const,
};
