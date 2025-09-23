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

    // Load progress from localStorage on mount
    const loadProgress = () => {
      try {
        const savedProgress = localStorage.getItem(`quiz-progress-${quizId}`);
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          if (Date.now() - progress.timestamp < 3600000) {
            return {
              currentQuestionIndex: progress.currentQuestionIndex,
              answers: progress.answers,
            };
          }
        }
      } catch (error) {
        console.warn("Failed to load quiz progress:", error);
      }
      return null;
    };

    const progress = loadProgress();
    if (progress) {
      console.log("Loaded quiz progress:", progress);
    }

    return () => {
      localStorage.removeItem(`quiz-progress-${quizId}`);
      saveProgress(); // Save final progress before unmounting
    };
  }, [quizId, currentQuestionIndex, answers]);
}
