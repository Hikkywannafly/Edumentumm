import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { kanbanApiClient } from "@/lib/api/kanban";
import type { ITask } from "@/types/task";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { kanbanQueryKeys } from "./kanban-query-keys";

// Get all tasks
export const useKanbanTasks = () => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: kanbanQueryKeys.tasksList(),
    queryFn: () => {
      if (!accessToken) throw new Error("Access token is required");
      return kanbanApiClient.getAllTasks(accessToken);
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Get single task by ID
export const useKanbanTask = (taskId: string) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: kanbanQueryKeys.task(taskId),
    queryFn: () => {
      if (!accessToken) throw new Error("Access token is required");
      return kanbanApiClient.getTaskById(taskId, accessToken);
    },
    enabled: !!accessToken && !!taskId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Create task mutation
export const useCreateKanbanTask = () => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: Omit<ITask, "id">) => {
      if (!accessToken) throw new Error("Access token is required");
      return kanbanApiClient.createTask(task, accessToken);
    },
    onSuccess: (newTask) => {
      // Update the tasks list cache
      queryClient.setQueryData<ITask[]>(
        kanbanQueryKeys.tasksList(),
        (oldTasks) => {
          if (!oldTasks) return [newTask];
          return [...oldTasks, newTask];
        },
      );

      // Optionally invalidate to refetch from server
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.tasksList(),
      });

      toast({
        title: "Success",
        description: "Task created successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });
};

// Update task mutation
export const useUpdateKanbanTask = () => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      updates,
    }: { taskId: string; updates: Partial<ITask> }) => {
      if (!accessToken) throw new Error("Access token is required");
      return kanbanApiClient.updateTask(taskId, updates, accessToken);
    },
    onSuccess: (updatedTask) => {
      // Update the tasks list cache
      queryClient.setQueryData<ITask[]>(
        kanbanQueryKeys.tasksList(),
        (oldTasks) => {
          if (!oldTasks) return [updatedTask];
          return oldTasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task,
          );
        },
      );

      // Update single task cache if it exists
      queryClient.setQueryData(
        kanbanQueryKeys.task(updatedTask.id),
        updatedTask,
      );

      toast({
        title: "Success",
        description: "Task updated successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });
};

// Delete task mutation
export const useDeleteKanbanTask = () => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => {
      if (!accessToken) throw new Error("Access token is required");
      return kanbanApiClient.deleteTask(taskId, accessToken);
    },
    onSuccess: (_, deletedTaskId) => {
      // Remove from tasks list cache
      queryClient.setQueryData<ITask[]>(
        kanbanQueryKeys.tasksList(),
        (oldTasks) => {
          if (!oldTasks) return [];
          return oldTasks.filter((task) => task.id !== deletedTaskId);
        },
      );

      // Remove single task cache
      queryClient.removeQueries({
        queryKey: kanbanQueryKeys.task(deletedTaskId),
      });

      toast({
        title: "Success",
        description: "Task deleted successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete task",
        variant: "destructive",
      });
    },
  });
};

// Batch update tasks mutation
export const useBatchUpdateKanbanTasks = () => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: { id: string; updates: Partial<ITask> }[]) => {
      if (!accessToken) throw new Error("Access token is required");
      return kanbanApiClient.batchUpdateTasks(updates, accessToken);
    },
    onSuccess: (updatedTasks) => {
      // Update the tasks list cache with all updated tasks
      queryClient.setQueryData<ITask[]>(
        kanbanQueryKeys.tasksList(),
        (oldTasks) => {
          if (!oldTasks) return updatedTasks;

          const updatedTasksMap = new Map(
            updatedTasks.map((task) => [task.id, task]),
          );

          return oldTasks.map((task) => updatedTasksMap.get(task.id) || task);
        },
      );

      // Update individual task caches
      for (const task of updatedTasks) {
        queryClient.setQueryData(kanbanQueryKeys.task(task.id), task);
      }

      toast({
        title: "Success",
        description: `${updatedTasks.length} tasks updated successfully`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update tasks",
        variant: "destructive",
      });
    },
  });
};

// Batch delete tasks mutation
export const useBatchDeleteKanbanTasks = () => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskIds: string[]) => {
      if (!accessToken) throw new Error("Access token is required");
      return kanbanApiClient.batchDeleteTasks(taskIds, accessToken);
    },
    onSuccess: (_, deletedTaskIds) => {
      // Remove from tasks list cache
      queryClient.setQueryData<ITask[]>(
        kanbanQueryKeys.tasksList(),
        (oldTasks) => {
          if (!oldTasks) return [];
          return oldTasks.filter((task) => !deletedTaskIds.includes(task.id));
        },
      );

      // Remove individual task caches
      for (const taskId of deletedTaskIds) {
        queryClient.removeQueries({
          queryKey: kanbanQueryKeys.task(taskId),
        });
      }

      toast({
        title: "Success",
        description: `${deletedTaskIds.length} tasks deleted successfully`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete tasks",
        variant: "destructive",
      });
    },
  });
};

// Optimistic update helpers
export const useOptimisticKanbanUpdate = () => {
  const queryClient = useQueryClient();

  const optimisticUpdateTask = (taskId: string, updates: Partial<ITask>) => {
    queryClient.setQueryData<ITask[]>(
      kanbanQueryKeys.tasksList(),
      (oldTasks) => {
        if (!oldTasks) return [];
        return oldTasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task,
        );
      },
    );
  };

  const rollbackOptimisticUpdate = () => {
    queryClient.invalidateQueries({
      queryKey: kanbanQueryKeys.tasksList(),
    });
  };

  return {
    optimisticUpdateTask,
    rollbackOptimisticUpdate,
  };
};

// Prefetch utilities
export const useKanbanPrefetch = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const prefetchTasks = async (): Promise<void> => {
    if (!accessToken) {
      console.warn(
        "useKanbanPrefetch: No access token available for prefetching tasks",
      );
      return;
    }

    try {
      await queryClient.prefetchQuery({
        queryKey: kanbanQueryKeys.tasksList(),
        queryFn: () => kanbanApiClient.getAllTasks(accessToken),
        staleTime: 5 * 60 * 1000,
      });
      console.log("useKanbanPrefetch: Tasks prefetched successfully");
    } catch (error) {
      console.error("useKanbanPrefetch: Failed to prefetch tasks", error);
    }
  };

  const prefetchTask = async (taskId: string): Promise<void> => {
    if (!accessToken) {
      console.warn(
        "useKanbanPrefetch: No access token available for prefetching task",
      );
      return;
    }

    if (!taskId) {
      console.warn("useKanbanPrefetch: No taskId provided for prefetching");
      return;
    }

    try {
      await queryClient.prefetchQuery({
        queryKey: kanbanQueryKeys.task(taskId),
        queryFn: () => kanbanApiClient.getTaskById(taskId, accessToken),
        staleTime: 5 * 60 * 1000,
      });
      console.log(`useKanbanPrefetch: Task ${taskId} prefetched successfully`);
    } catch (error) {
      console.error(
        `useKanbanPrefetch: Failed to prefetch task ${taskId}`,
        error,
      );
    }
  };

  // Prefetch multiple tasks at once
  const prefetchMultipleTasks = async (taskIds: string[]): Promise<void> => {
    if (!accessToken) {
      console.warn(
        "useKanbanPrefetch: No access token available for prefetching multiple tasks",
      );
      return;
    }

    if (!taskIds || taskIds.length === 0) {
      console.warn("useKanbanPrefetch: No taskIds provided for prefetching");
      return;
    }

    try {
      const prefetchPromises = taskIds.map((taskId) =>
        queryClient.prefetchQuery({
          queryKey: kanbanQueryKeys.task(taskId),
          queryFn: () => kanbanApiClient.getTaskById(taskId, accessToken),
          staleTime: 5 * 60 * 1000,
        }),
      );

      await Promise.allSettled(prefetchPromises);
      console.log(
        `useKanbanPrefetch: ${taskIds.length} tasks prefetch completed`,
      );
    } catch (error) {
      console.error(
        "useKanbanPrefetch: Failed to prefetch multiple tasks",
        error,
      );
    }
  };

  // Prefetch all essential data at once
  const prefetchEssentialData = async (): Promise<void> => {
    if (!accessToken) {
      console.warn(
        "useKanbanPrefetch: No access token available for prefetching essential data",
      );
      return;
    }

    try {
      await prefetchTasks();
      console.log("useKanbanPrefetch: Essential data prefetch completed");
    } catch (error) {
      console.error(
        "useKanbanPrefetch: Failed to prefetch essential data",
        error,
      );
    }
  };

  return {
    prefetchTasks,
    prefetchTask,
    prefetchMultipleTasks,
    prefetchEssentialData,
  };
};
