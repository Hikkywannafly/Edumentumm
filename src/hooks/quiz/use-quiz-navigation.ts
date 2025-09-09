import type { QuizAnswer, QuizQuestionResult } from "@/types/quiz-take";
import { useMemo } from "react";

interface UseQuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  answers: QuizAnswer[];
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
  currentQuestion,
  totalQuestions,
  answers,
  showFeedback,
  currentQuestionResult,
}: UseQuizNavigationProps): UseQuizNavigationReturn {
  const isAnswered = useMemo(() => {
    return !!answers[currentQuestion] || !!currentQuestionResult;
  }, [answers, currentQuestion, currentQuestionResult]);

  const hasNextQuestion = currentQuestion < totalQuestions - 1;
  const hasPreviousQuestion = currentQuestion > 0;
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
