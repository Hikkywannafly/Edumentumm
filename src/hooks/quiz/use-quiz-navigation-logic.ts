import type { BackendQuestion } from "@/types/quiz";
import type { QuizAnswer } from "@/types/quiz-take";
import { useCallback, useState } from "react";

interface UseQuizNavigationLogicProps {
  questions: BackendQuestion[];
}

interface UseQuizNavigationLogicReturn {
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  isCompleted: boolean;
  setCurrentQuestionIndex: (index: number) => void;
  setAnswers: React.Dispatch<React.SetStateAction<QuizAnswer[]>>;
  setIsCompleted: (completed: boolean) => void;
  handleAnswerChange: (questionId: string, optionId: string) => void;
  handleNavigateToQuestion: (index: number) => void;
  handlePrevious: () => void;
  handleNext: () => void;
  handleRetake: () => void;
}

export function useQuizNavigationLogic({
  questions,
}: UseQuizNavigationLogicProps): UseQuizNavigationLogicReturn {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleAnswerChange = useCallback(
    (questionId: string, optionId: string) => {
      setAnswers((prev) => {
        const existing = prev.find((a) => a.questionId === questionId);
        if (existing) {
          return prev.map((a) =>
            a.questionId === questionId
              ? { ...a, selectedOptionId: optionId }
              : a,
          );
        }
        return [
          ...prev,
          { questionId, selectedOptionId: optionId, timeSpent: 0 },
        ];
      });
    },
    [],
  );

  const handleNavigateToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length && !isCompleted) {
        setCurrentQuestionIndex(index);
      }
    },
    [questions.length, isCompleted],
  );

  const handlePrevious = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      if (prev < questions.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [questions.length]);

  const handleRetake = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsCompleted(false);
  }, []);

  return {
    currentQuestionIndex,
    answers,
    isCompleted,
    setCurrentQuestionIndex,
    setAnswers,
    setIsCompleted,
    handleAnswerChange,
    handleNavigateToQuestion,
    handlePrevious,
    handleNext,
    handleRetake,
  };
}
