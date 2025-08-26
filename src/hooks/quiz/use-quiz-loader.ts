"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  BackendQuizEntity,
  UseQuizLoaderReturn,
} from "./quiz-editor-types";

export function useQuizLoader(quizId: number): UseQuizLoaderReturn {
  // Fetch quiz data
  const {
    data: originalQuiz,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async (): Promise<BackendQuizEntity> => {
      const accessToken = localStorage.getItem("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/quiz/${quizId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to load quiz: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.id) {
        throw new Error("Invalid quiz data received from server");
      }

      return data as BackendQuizEntity;
    },
    enabled: !!quizId,
  });

  return {
    originalQuiz: originalQuiz || null,
    isLoading,
    isError,
    error,
    refetch,
  };
}
