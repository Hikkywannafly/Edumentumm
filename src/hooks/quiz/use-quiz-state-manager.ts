"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
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

  const quiz =
    queryClient.getQueryData<GeneratedQuiz>(["quiz-editing", quizId]) ||
    originalQuiz;

  const changedFields = useMemo(() => {
    if (!quiz || !originalQuiz) return {};

    const changes: Partial<GeneratedQuiz> = {};

    if (quiz.title !== originalQuiz.title) {
      changes.title = quiz.title;
    }

    if (quiz.description !== originalQuiz.description) {
      changes.description = quiz.description;
    }

    const questionsChanged =
      JSON.stringify(quiz.questions) !== JSON.stringify(originalQuiz.questions);
    if (questionsChanged) {
      changes.questions = quiz.questions;
    }

    const metadataChanged =
      JSON.stringify(quiz.metadata) !== JSON.stringify(originalQuiz.metadata);
    if (metadataChanged) {
      changes.metadata = quiz.metadata;
    }

    return changes;
  }, [quiz, originalQuiz]);

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
  const hasUnsavedChanges = Object.keys(changedFields).length > 0;

  const isValid = quiz
    ? quiz.title.trim().length > 0 && quiz.questions.length > 0
    : false;

  return {
    quiz,
    updateQuiz,
    hasUnsavedChanges,
    changedFields,
    isValid,
    reset,
  };
}
