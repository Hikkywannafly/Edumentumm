"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convertBackendToFrontend } from "./quiz-data-converter";
import type {
  BackendQuizEntity,
  GeneratedQuiz,
  UpdateQuizData,
  UseQuizStateManagerReturn,
} from "./quiz-editor-types";

export function useQuizStateManager(
  quizId: number,
  originalQuiz: BackendQuizEntity | null,
): UseQuizStateManagerReturn {
  const queryClient = useQueryClient();

  // Get current quiz state from cache or original
  const quiz =
    queryClient.getQueryData<GeneratedQuiz>(["quiz-editing", quizId]) ||
    (originalQuiz ? convertBackendToFrontend(originalQuiz) : null);

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
        queryClient.setQueryData(
          ["quiz-editing", quizId],
          convertBackendToFrontend(originalQuiz),
        );
      }
    },
  });

  const updateQuiz = async (updates: UpdateQuizData) => {
    await updateMutation.mutateAsync(updates);
  };

  const reset = () => {
    if (originalQuiz) {
      queryClient.setQueryData(
        ["quiz-editing", quizId],
        convertBackendToFrontend(originalQuiz),
      );
    }
    updateMutation.reset();
  };

  // Calculate derived state
  const hasUnsavedChanges =
    quiz && originalQuiz
      ? JSON.stringify(quiz) !==
        JSON.stringify(convertBackendToFrontend(originalQuiz))
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
