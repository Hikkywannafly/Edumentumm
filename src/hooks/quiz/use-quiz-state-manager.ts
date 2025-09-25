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

    // Compare basic fields
    if (quiz.title !== originalQuiz.title) {
      changes.title = quiz.title;
    }

    if (quiz.description !== originalQuiz.description) {
      changes.description = quiz.description;
    }

    // Compare questions
    const questionsChanged =
      JSON.stringify(quiz.questions) !== JSON.stringify(originalQuiz.questions);
    if (questionsChanged) {
      changes.questions = quiz.questions;
    }

    // Compare metadata
    const metadataChanged =
      JSON.stringify(quiz.metadata) !== JSON.stringify(originalQuiz.metadata);
    if (metadataChanged) {
      changes.metadata = quiz.metadata;
    }

    // Compare settings
    const settingsChanged =
      JSON.stringify(quiz.settings) !== JSON.stringify(originalQuiz.settings);
    if (settingsChanged) {
      changes.settings = quiz.settings;
    }

    // Handle top-level settings fields (when updated via settings dialog)
    // These are sent as flat properties rather than in the settings object
    const quizObj = quiz as any;
    const originalQuizObj = originalQuiz as any;

    // Explicitly handle each top-level setting field
    if (
      quizObj.visibility !== undefined &&
      quizObj.visibility !== originalQuizObj.visibility
    ) {
      (changes as any).visibility = quizObj.visibility;
    }
    if (
      quizObj.status !== undefined &&
      quizObj.status !== originalQuizObj.status
    ) {
      (changes as any).status = quizObj.status;
    }
    if (
      quizObj.isPremium !== undefined &&
      quizObj.isPremium !== originalQuizObj.isPremium
    ) {
      (changes as any).isPremium = quizObj.isPremium;
    }
    if (
      quizObj.isFeatured !== undefined &&
      quizObj.isFeatured !== originalQuizObj.isFeatured
    ) {
      (changes as any).isFeatured = quizObj.isFeatured;
    }
    if (
      quizObj.isTrending !== undefined &&
      quizObj.isTrending !== originalQuizObj.isTrending
    ) {
      (changes as any).isTrending = quizObj.isTrending;
    }
    if (
      quizObj.estimatedTime !== undefined &&
      quizObj.estimatedTime !== originalQuizObj.estimatedTime
    ) {
      (changes as any).estimatedTime = quizObj.estimatedTime;
    }
    if (
      quizObj.passingScore !== undefined &&
      quizObj.passingScore !== originalQuizObj.passingScore
    ) {
      (changes as any).passingScore = quizObj.passingScore;
    }
    if (
      quizObj.maxAttempts !== undefined &&
      quizObj.maxAttempts !== originalQuizObj.maxAttempts
    ) {
      (changes as any).maxAttempts = quizObj.maxAttempts;
    }

    return changes;
  }, [quiz, originalQuiz]);

  // Update quiz mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: UpdateQuizData): Promise<void> => {
      if (!quiz) throw new Error("No quiz to update");

      // Create updated quiz object
      const updatedQuiz: GeneratedQuiz = {
        ...quiz,
        ...updates,
      };

      // If updates contain top-level settings fields, also update the settings object
      // This ensures consistency between flat properties and the settings object
      const updatesObj = updates as any;
      const hasTopLevelSettings =
        updatesObj.visibility !== undefined ||
        updatesObj.status !== undefined ||
        updatesObj.isPremium !== undefined ||
        updatesObj.isFeatured !== undefined ||
        updatesObj.isTrending !== undefined ||
        updatesObj.estimatedTime !== undefined ||
        updatesObj.passingScore !== undefined ||
        updatesObj.maxAttempts !== undefined;

      if (hasTopLevelSettings && quiz.settings) {
        // Update the settings object to match the top-level properties
        updatedQuiz.settings = { ...quiz.settings };

        // Map top-level fields to settings object
        if (updatesObj.visibility !== undefined) {
          updatedQuiz.settings.visibility = updatesObj.visibility;
        }
        if (updatesObj.status !== undefined) {
          updatedQuiz.settings.status = updatesObj.status;
        }
        if (updatesObj.isPremium !== undefined) {
          updatedQuiz.settings.isPremium = updatesObj.isPremium;
        }
        if (updatesObj.isFeatured !== undefined) {
          updatedQuiz.settings.isFeatured = updatesObj.isFeatured;
        }
        if (updatesObj.isTrending !== undefined) {
          updatedQuiz.settings.isTrending = updatesObj.isTrending;
        }
        if (updatesObj.estimatedTime !== undefined) {
          updatedQuiz.settings.estimatedTime = updatesObj.estimatedTime;
        }
        if (updatesObj.passingScore !== undefined) {
          updatedQuiz.settings.passingScore = updatesObj.passingScore;
        }
        if (updatesObj.maxAttempts !== undefined) {
          updatedQuiz.settings.maxAttempts = updatesObj.maxAttempts;
        }

        // Preserve other required settings
        updatedQuiz.settings = {
          ...quiz.settings,
          ...updatedQuiz.settings,
          language: quiz.settings.language || "AUTO",
          question_type: quiz.settings.question_type || "MIXED",
          number_of_questions: quiz.settings.number_of_questions || 10,
          mode: quiz.settings.mode || "QUIZ",
          difficulty: quiz.settings.difficulty || "MEDIUM",
          task: quiz.settings.task || "GENERATE_QUIZ",
          parsing_mode: quiz.settings.parsing_mode || "BALANCED",
          shuffle_questions: quiz.settings.shuffle_questions || false,
          shuffle_answers: quiz.settings.shuffle_answers || false,
          show_explanations: quiz.settings.show_explanations || true,
          allow_retry: quiz.settings.allow_retry || true,
          passing_score: quiz.settings.passing_score || 70,
        };
      }

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
    ? quiz.title?.trim().length > 0 &&
      quiz.questions &&
      quiz.questions.length > 0
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
