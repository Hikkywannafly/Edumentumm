// Query keys factory for kanban board queries
export const kanbanQueryKeys = {
  // All kanban-related queries
  all: ["kanban"] as const,

  // All tasks queries
  tasks: () => [...kanbanQueryKeys.all, "tasks"] as const,

  // All tasks list
  tasksList: () => [...kanbanQueryKeys.tasks(), "list"] as const,

  // Filtered tasks list
  tasksListFiltered: (filters: {
    status?: "TODO" | "IN_PROGRESS" | "DONE";
    dateFrom?: Date;
    dateTo?: Date;
  }) => [...kanbanQueryKeys.tasksList(), filters] as const,

  // Single task
  task: (taskId: string) =>
    [...kanbanQueryKeys.tasks(), "detail", taskId] as const,
} as const;

export type KanbanQueryKeys = typeof kanbanQueryKeys;
