"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { GeneratedQuiz, UseQuizSaverReturn } from "./quiz-editor-types";

export function useQuizSaverEditor(
  quizId: string,
  quiz: GeneratedQuiz | null,
): UseQuizSaverReturn {
  const queryClient = useQueryClient();

  // Save quiz mutation
  const saveMutation = useMutation({
    mutationFn: async (): Promise<any> => {
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
          questions: quiz.questions,
          metadata: quiz.metadata || {},
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save quiz");
      }

      return response.json();
    },
    onSuccess: () => {
      // IneryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
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
