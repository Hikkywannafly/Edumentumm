"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convertBackendToFrontend } from "./quiz-data-converter";
import type {
  BackendQuizEntity,
  GeneratedQuiz,
  UseQuizSaverReturn,
} from "./quiz-editor-types";

export function useQuizSaverEditor(
  quizId: number,
  quiz: GeneratedQuiz | null,
): UseQuizSaverReturn {
  const queryClient = useQueryClient();

  // Save quiz mutation
  const saveMutation = useMutation({
    mutationFn: async (): Promise<BackendQuizEntity> => {
      if (!quiz) throw new Error("No quiz to save");

      const accessToken = localStorage.getItem("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/quiz/${quizId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          title: quiz.title,
          description: quiz.description,
          quiz_data: {
            questions: quiz.questions,
            settings: quiz.settings || {},
            metadata: quiz.metadata || {},
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save quiz");
      }

      return response.json();
    },
    onSuccess: (savedQuiz) => {
      // Update both caches
      queryClient.setQueryData(["quiz", quizId], savedQuiz);
      queryClient.setQueryData(
        ["quiz-editing", quizId],
        convertBackendToFrontend(savedQuiz),
      );

      // Invalidate quiz list
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });

  const saveQuiz = async () => {
    await saveMutation.mutateAsync();
  };

  return {
    saveQuiz,
    isSaving: saveMutation.isPending,
    error: saveMutation.error,
  };
}
