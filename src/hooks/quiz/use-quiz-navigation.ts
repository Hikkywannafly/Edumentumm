import type { QuizQuestionResult } from "@/types/quiz-take";
import { useMemo } from "react";

interface UseQuizNavigationProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  showFeedback: boolean;
  currentQuestionResult: QuizQuestionResult | null;
}

interface UseQuizNavigationReturn {
  isAnswered: boolean;
  hasNextQuestion: boolean;
  hasPreviousQuestion: boolean;
  showFeedbackUI: boolean;
  isCorrect: boolean | null;
}

export function useQuizNavigation({
  currentQuestionIndex,
  totalQuestions,
  showFeedback,
  currentQuestionResult,
}: UseQuizNavigationProps): UseQuizNavigationReturn {
  const isAnswered = useMemo(() => {
    // This will be calculated in the component since we need the question ID
    return false;
  }, []);

  const hasNextQuestion = currentQuestionIndex < totalQuestions - 1;
  const hasPreviousQuestion = currentQuestionIndex > 0;
  const showFeedbackUI = showFeedback && !!currentQuestionResult;
  const isCorrect = currentQuestionResult?.isCorrect ?? null;

  return {
    isAnswered,
    hasNextQuestion,
    hasPreviousQuestion,
    showFeedbackUI,
    isCorrect,
  };
}
