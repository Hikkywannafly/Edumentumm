import { apiClient } from "@/lib/api/client";
import type { BackendQuizEntity } from "@/types/quiz";
import { useQuery } from "@tanstack/react-query";

interface UseQuizDetailParams {
  id: string | number;
  enabled?: boolean;
}

export function useQuizDetail({ id, enabled = true }: UseQuizDetailParams) {
  return useQuery({
    queryKey: ["quiz", id],
    queryFn: async (): Promise<BackendQuizEntity> => {
      // Get authentication token from localStorage
      const accessToken = localStorage.getItem("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await apiClient.get(`/student/quizzes/${id}`, {
        headers,
      });
      return response.data.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });
}
