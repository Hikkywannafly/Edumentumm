import type { QuizQuestionResult } from "@/types/quiz-take";
import { useMemo } from "react";

interface UseQuizNavigationProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  showFeedback: boolean;
  currentQuestionResult: QuizQuestionResult | null;
  // Add answers array to properly calculate isAnswered
  answers: Array<{ questionId: string }>;
  currentQuestionId: string | null;
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
  answers,
  currentQuestionId,
}: UseQuizNavigationProps): UseQuizNavigationReturn {
  const isAnswered = useMemo(() => {
    // Properly calculate if the current question has been answered
    if (!currentQuestionId) return false;
    return answers.some((a) => a.questionId === currentQuestionId);
  }, [answers, currentQuestionId]);

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
