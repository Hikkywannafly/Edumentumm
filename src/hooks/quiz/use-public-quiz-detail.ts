import { apiClient } from "@/lib/api/client";
import type { BackendQuizEntity } from "@/types/quiz";
import { useQuery } from "@tanstack/react-query";

interface UsePublicQuizDetailParams {
  id: string | number;
  enabled?: boolean;
}

export function usePublicQuizDetail({
  id,
  enabled = true,
}: UsePublicQuizDetailParams) {
  return useQuery({
    queryKey: ["public-quiz", id],
    queryFn: async (): Promise<BackendQuizEntity> => {
      // Get authentication token from localStorage (optional for public quizzes)
      const accessToken = localStorage.getItem("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await apiClient.get(`/public/quizzes/${id}`, {
        headers,
      });
      return response.data.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
