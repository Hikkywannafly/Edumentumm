"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GeneratedQuiz,
  UpdateQuizData,
  UseQuizStateManagerReturn,
} from "./quiz-editor-types";

export function useQuizStateManager(
  quizId: string,
  originalQuiz: GeneratedQuiz | null,
): UseQuizStateManagerReturn {
  const queryClient = useQueryClient();

  // Get current quiz state from cache or original
  const quiz =
    queryClient.getQueryData<GeneratedQuiz>(["quiz-editing", quizId]) ||
    originalQuiz;

  // Update quiz mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: UpdateQuizData): Promise<void> => {
      if (!quiz) throw new Error("No quiz to update");

      const updatedQuiz: GeneratedQuiz = {
        ...quiz,
        ...updates,
      };

      // Update cache immediately for optimistic updates
      queryClient.setQueryData(["quiz-editing", quizId], updatedQuiz);
    },
    onError: () => {
      // Revert on error
      if (originalQuiz) {
        queryClient.setQueryData(["quiz-editing", quizId], originalQuiz);
      }
    },
  });

  const updateQuiz = async (updates: UpdateQuizData) => {
    await updateMutation.mutateAsync(updates);
  };

  const reset = () => {
    if (originalQuiz) {
      queryClient.setQueryData(["quiz-editing", quizId], originalQuiz);
    }
    updateMutation.reset();
  };

  // Calculate derived state
  const hasUnsavedChanges =
    quiz && originalQuiz
      ? JSON.stringify(quiz) !== JSON.stringify(originalQuiz)
      : false;

  const isValid = quiz
    ? quiz.title.trim().length > 0 && quiz.questions.length > 0
    : false;

  return {
    quiz,
    updateQuiz,
    hasUnsavedChanges,
    isValid,
    reset,
  };
}
