export const todoQueryKeys = {
  // Base query key for all todos
  all: ["todos"] as const,

  // Get all todos for a user
  list: () => [...todoQueryKeys.all, "list"] as const,

  // Get a specific todo by ID
  detail: (todoId: string) => [...todoQueryKeys.all, "detail", todoId] as const,
} as const;
