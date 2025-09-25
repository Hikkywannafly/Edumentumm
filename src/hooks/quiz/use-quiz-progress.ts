import type { QuizAnswer } from "@/types/quiz-take";
import { useEffect } from "react";

interface UseQuizProgressProps {
  quizId: string | number;
  currentQuestionIndex: number;
  answers: QuizAnswer[];
}

export function useQuizProgress({
  quizId,
  currentQuestionIndex,
  answers,
}: UseQuizProgressProps) {
  useEffect(() => {
    // Clear any existing progress when component mounts
    try {
      localStorage.removeItem(`quiz-progress-${quizId}`);
    } catch (error) {
      console.warn("Failed to clear quiz progress:", error);
    }

    const saveProgress = () => {
      try {
        const progress = {
          quizId,
          currentQuestionIndex,
          answers,
          timestamp: Date.now(),
        };
        localStorage.setItem(
          `quiz-progress-${quizId}`,
          JSON.stringify(progress),
        );
      } catch (error) {
        console.warn("Failed to save quiz progress:", error);
      }
    };

    // Save progress periodically or when component unmounts
    const interval = setInterval(saveProgress, 5000); // Save every 5 seconds

    return () => {
      clearInterval(interval);
      // Clear progress on unmount (quiz completed or exited)
      localStorage.removeItem(`quiz-progress-${quizId}`);
    };
  }, [quizId, currentQuestionIndex, answers]);
}
