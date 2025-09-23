import type { ITask } from "@/types/task";
import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/student`;

// Create axios instance with default config
const kanbanApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
kanbanApi.interceptors.request.use(
  (config) => {
    // Token will be passed as parameter in the query functions
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
kanbanApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error("Unauthorized access - token may be expired");
    } else if (error.response?.status === 403) {
      // Handle forbidden access
      console.error("Access denied - insufficient permissions");
    }
    return Promise.reject(error);
  },
);

// API functions
export const kanbanApiClient = {
  // Get all tasks
  getAllTasks: async (accessToken: string): Promise<ITask[]> => {
    const response = await kanbanApi.get("/tasks", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    // API returns { data: [...], total: number, message: string, status: string }
    // Extract the actual tasks array from the data property
    return response.data?.data || response.data || [];
  },

  // Get task by ID
  getTaskById: async (taskId: string, accessToken: string): Promise<ITask> => {
    const response = await kanbanApi.get(`/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  // Create new task
  createTask: async (
    task: Omit<ITask, "id">,
    accessToken: string,
  ): Promise<ITask> => {
    const response = await kanbanApi.post(
      "/tasks",
      {
        ...task,
        status: task.status.toUpperCase(),
        dueDate: task.dueDate.toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  },

  // Update task
  updateTask: async (
    taskId: string,
    updates: Partial<ITask>,
    accessToken: string,
  ): Promise<ITask> => {
    const response = await kanbanApi.put(
      `/tasks/${taskId}`,
      {
        ...updates,
        status: updates.status?.toUpperCase(),
        dueDate: updates.dueDate?.toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  },

  // Delete task
  deleteTask: async (taskId: string, accessToken: string): Promise<void> => {
    await kanbanApi.delete(`/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  // Batch update tasks
  batchUpdateTasks: async (
    updates: { id: string; updates: Partial<ITask> }[],
    accessToken: string,
  ): Promise<ITask[]> => {
    const response = await kanbanApi.put(
      "/tasks/batch",
      {
        tasks: updates.map((item) => ({
          id: item.id,
          ...item.updates,
          status: item.updates.status?.toUpperCase(),
          dueDate: item.updates.dueDate?.toISOString(),
        })),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  },

  // Batch delete tasks
  batchDeleteTasks: async (
    taskIds: string[],
    accessToken: string,
  ): Promise<void> => {
    await kanbanApi.delete("/tasks/batch", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: { taskIds },
    });
  },
};

export default kanbanApiClient;
