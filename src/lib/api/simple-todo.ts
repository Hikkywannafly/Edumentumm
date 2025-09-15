// Backend API response interface
export interface BackendTodo {
  id: number;
  nameTask: string;
  status: "COMPLETED" | "PENDING";
  creationAt?: string;
}

// Simplified Todo interface - only shows nameTask on UI
export interface Todo {
  id: string;
  nameTask: string;
  status: "COMPLETED" | "PENDING";
  createdAt?: string;
}

export interface CreateTodoRequest {
  nameTask: string;
  status?: "PENDING" | "COMPLETED";
}

export interface UpdateTodoRequest {
  nameTask?: string;
  status?: "PENDING" | "COMPLETED";
}

export interface TodoApiResponse {
  data: BackendTodo[];
  message?: string;
}

export interface SingleTodoApiResponse {
  data: BackendTodo;
  message?: string;
}

class SimpleTodoService {
  // Utility function to convert backend format to frontend format
  private backendToFrontend = (backendTodo: BackendTodo): Todo => {
    return {
      id: backendTodo.id.toString(),
      nameTask: backendTodo.nameTask,
      status: backendTodo.status,
      createdAt: backendTodo.creationAt,
    };
  };

  private request = async <T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> => {
    // Use Next.js API routes instead of direct external API calls
    const url = `/api${endpoint}`;

    // Check if we're in the browser before accessing localStorage
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log("❌ SimpleTodo API Error data:", errorData);
        throw new Error(
          errorData.error ||
            errorData.message ||
            `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unexpected error occurred");
    }
  };

  // Utility function to validate and sanitize todo data
  private validateTodoData = (data: CreateTodoRequest): CreateTodoRequest => {
    return {
      nameTask: data.nameTask?.trim() || "",
      status: data.status || "PENDING",
    };
  };

  // Validate update todo data
  private validateUpdateTodoData = (
    data: UpdateTodoRequest,
  ): UpdateTodoRequest => {
    const validatedData: UpdateTodoRequest = {};

    if (data.nameTask !== undefined) {
      validatedData.nameTask = data.nameTask.trim();
    }

    if (data.status !== undefined) {
      validatedData.status = data.status;
    }

    return validatedData;
  };

  getAllTodos = async (): Promise<Todo[]> => {
    try {
      const response = await this.request<BackendTodo[] | TodoApiResponse>(
        "/todos",
      );

      // Handle both direct array and wrapped response formats
      const todos = Array.isArray(response) ? response : response.data || [];

      return todos.map((todo) => this.backendToFrontend(todo));
    } catch (error) {
      console.error("❌ SimpleTodoService: Error fetching todos:", error);
      throw error;
    }
  };

  createTodo = async (todoData: CreateTodoRequest): Promise<Todo> => {
    try {
      // Validate and sanitize data before sending to API
      const validatedData = this.validateTodoData(todoData);

      const response = await this.request<BackendTodo | SingleTodoApiResponse>(
        "/todos",
        {
          method: "POST",
          body: JSON.stringify(validatedData),
        },
      );

      // Handle both direct object and wrapped response formats
      const todo = "data" in response ? response.data : response;

      return this.backendToFrontend(todo);
    } catch (error) {
      console.error("❌ SimpleTodoService: Error creating todo:", error);
      throw error;
    }
  };

  updateTodo = async (
    todoId: string,
    todoData: UpdateTodoRequest,
  ): Promise<Todo> => {
    try {
      // Validate and sanitize data before sending to API
      const validatedData = this.validateUpdateTodoData(todoData);

      const response = await this.request<BackendTodo | SingleTodoApiResponse>(
        `/todos/${todoId}`,
        {
          method: "PUT",
          body: JSON.stringify(validatedData),
        },
      );

      // Handle both direct object and wrapped response formats
      const todo = "data" in response ? response.data : response;

      return this.backendToFrontend(todo);
    } catch (error) {
      console.error("❌ SimpleTodoService: Error updating todo:", error);
      throw error;
    }
  };

  deleteTodo = async (todoId: string): Promise<void> => {
    try {
      await this.request(`/todos/${todoId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("❌ SimpleTodoService: Error deleting todo:", error);
      throw error;
    }
  };

  toggleTodoCompletion = async (
    todoId: string,
    completed: boolean,
    nameTask: string,
  ): Promise<Todo> => {
    try {
      return await this.updateTodo(todoId, {
        nameTask: nameTask,
        status: completed ? "COMPLETED" : "PENDING",
      });
    } catch (error) {
      console.error(
        "❌ SimpleTodoService: Error toggling todo completion:",
        error,
      );
      throw error;
    }
  };

  // Utility function to calculate todo statistics
  calculateStats = (todos: Todo[]) => {
    const totalTodos = todos.length;
    const completedTodos = todos.filter(
      (todo) => todo.status === "COMPLETED",
    ).length;
    const pendingTodos = todos.filter(
      (todo) => todo.status === "PENDING",
    ).length;
    const completionRate =
      totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

    return {
      totalTodos,
      completedTodos,
      pendingTodos,
      completionRate,
    };
  };

  // Filter todos by status
  filterByStatus = (todos: Todo[], status: "COMPLETED" | "PENDING"): Todo[] => {
    return todos.filter((todo) => todo.status === status);
  };

  // Search todos by nameTask
  searchTodos = (todos: Todo[], searchTerm: string): Todo[] => {
    if (!searchTerm.trim()) {
      return todos;
    }
    const term = searchTerm.toLowerCase();
    return todos.filter((todo) => todo.nameTask.toLowerCase().includes(term));
  };
}

export const simpleTodoService = new SimpleTodoService();
