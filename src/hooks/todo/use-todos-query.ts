import { toast } from "@/hooks/use-toast";
import { simpleTodoService } from "@/lib/api/simple-todo";
import type {
  CreateTodoRequest,
  Todo,
  UpdateTodoRequest,
} from "@/lib/api/simple-todo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { todoQueryKeys } from "../todo-query-keys";

// Hook to fetch all todos
export function useTodos() {
  return useQuery({
    queryKey: todoQueryKeys.list(),
    queryFn: simpleTodoService.getAllTodos,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook to create a new todo
export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todoData: CreateTodoRequest) =>
      simpleTodoService.createTodo(todoData),
    onSuccess: (newTodo) => {
      // Update the todos list cache
      queryClient.setQueryData<Todo[]>(todoQueryKeys.list(), (oldTodos) => {
        return oldTodos ? [...oldTodos, newTodo] : [newTodo];
      });

      toast({
        title: "Success",
        description: "Todo created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create todo",
        variant: "destructive",
      });
    },
  });
}

// Hook to update a todo
export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      todoId,
      todoData,
    }: { todoId: string; todoData: UpdateTodoRequest }) =>
      simpleTodoService.updateTodo(todoId, todoData),
    onSuccess: (updatedTodo) => {
      // Update the todos list cache
      queryClient.setQueryData<Todo[]>(todoQueryKeys.list(), (oldTodos) => {
        return oldTodos
          ? oldTodos.map((todo) =>
              todo.id === updatedTodo.id ? updatedTodo : todo,
            )
          : [updatedTodo];
      });

      toast({
        title: "Success",
        description: "Todo updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update todo",
        variant: "destructive",
      });
    },
  });
}

// Hook to delete a todo
export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: simpleTodoService.deleteTodo,
    onSuccess: (_, deletedTodoId) => {
      // Update the todos list cache
      queryClient.setQueryData<Todo[]>(todoQueryKeys.list(), (oldTodos) => {
        return oldTodos
          ? oldTodos.filter((todo) => todo.id !== deletedTodoId)
          : [];
      });

      toast({
        title: "Success",
        description: "Todo deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete todo",
        variant: "destructive",
      });
    },
  });
}

// Hook to toggle todo completion
export function useToggleTodoCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      todoId,
      completed,
      nameTask,
    }: { todoId: string; completed: boolean; nameTask: string }) =>
      simpleTodoService.toggleTodoCompletion(todoId, completed, nameTask),
    onSuccess: (updatedTodo) => {
      // Update the todos list cache
      queryClient.setQueryData<Todo[]>(todoQueryKeys.list(), (oldTodos) => {
        return oldTodos
          ? oldTodos.map((todo) =>
              todo.id === updatedTodo.id ? updatedTodo : todo,
            )
          : [updatedTodo];
      });

      toast({
        title: "Success",
        description: "Todo updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update todo",
        variant: "destructive",
      });
    },
  });
}
