"use client";

import type { UseQuizEditorReturn } from "./quiz-editor-types";
import { useQuestionManager } from "./use-question-manager";
import { useQuizLoader } from "./use-quiz-loader";
import { useQuizSaverEditor } from "./use-quiz-saver-editor";
import { useQuizStateManager } from "./use-quiz-state-manager";

export function useQuizEditor(quizId: number): UseQuizEditorReturn {
  // Use specialized hooks
  const quizLoader = useQuizLoader(quizId);
  const quizStateManager = useQuizStateManager(quizId, quizLoader.originalQuiz);
  const quizSaver = useQuizSaverEditor(quizId, quizStateManager.quiz);
  const questionManager = useQuestionManager(
    quizStateManager.quiz,
    quizStateManager.updateQuiz,
  );

  // Combined reset function
  const reset = () => {
    quizStateManager.reset();
  };

  // Return composed functionality
  return {
    // Data loading
    originalQuiz: quizLoader.originalQuiz,
    isLoading: quizLoader.isLoading,
    isError: quizLoader.isError,
    refetch: quizLoader.refetch,

    // Quiz state management
    quiz: quizStateManager.quiz,
    updateQuiz: quizStateManager.updateQuiz,
    hasUnsavedChanges: quizStateManager.hasUnsavedChanges,
    isValid: quizStateManager.isValid,

    // Quiz saving
    saveQuiz: quizSaver.saveQuiz,
    isSaving: quizSaver.isSaving,

    // Question management
    addQuestion: questionManager.addQuestion,
    updateQuestion: questionManager.updateQuestion,
    deleteQuestion: questionManager.deleteQuestion,
    moveQuestion: questionManager.moveQuestion,

    // Combined error state
    error: quizLoader.error || quizSaver.error,

    // Utilities
    reset,
  };
}
