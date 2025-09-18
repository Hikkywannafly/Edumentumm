import type { BackendQuestion, BackendQuizEntity } from "@/types/quiz";
import type { QuizAnswer, QuizResult } from "@/types/quiz-take";
import { useCallback } from "react";

interface UseQuizResultsProps {
  quiz: BackendQuizEntity;
  questions: BackendQuestion[];
  answers: QuizAnswer[];
}

interface UseQuizResultsReturn {
  calculateResult: (backendTimeSpent?: number) => QuizResult;
}

export function useQuizResults({
  quiz,
  questions,
  answers,
}: UseQuizResultsProps): UseQuizResultsReturn {
  const calculateResult = useCallback(
    (backendTimeSpent?: number): QuizResult => {
      let correctAnswers = 0;
      let totalScore = 0;
      let totalTimeSpent = 0;
      const maxScore =
        questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;

      const detailedAnswers = (questions || []).map((question) => {
        const userAnswer = answers.find((a) => a.questionId === question.id);

        // Add time spent for this question to total
        if (userAnswer) {
          totalTimeSpent += Number.parseInt(userAnswer.timeSpent, 10) || 0;
        }

        let isCorrect = false;
        let correctOptionId = "";

        if (
          question.type === "FILL_BLANK" ||
          question.type === "FREE_RESPONSE"
        ) {
          const userText =
            userAnswer?.selectedOptionId?.trim().toLowerCase() || "";
          const correctText =
            question.correctAnswer?.trim().toLowerCase() || "";
          isCorrect = userText === correctText;
          correctOptionId = question.correctAnswer || "";
        } else {
          correctOptionId = question.correctAnswer || "";
          isCorrect = userAnswer?.selectedOptionId === correctOptionId;
        }

        if (isCorrect) {
          correctAnswers++;
          totalScore += question.points || 1;
        }

        return {
          questionId: question.id,
          selectedOptionId: userAnswer?.selectedOptionId || "",
          correctOptionId,
          isCorrect,
          question,
        };
      });

      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      const passed = percentage >= (quiz.passingScore || 70);

      // Use backend time if it's valid and greater than 0, otherwise use our calculated time
      let finalTimeSpent = totalTimeSpent;
      if (backendTimeSpent !== undefined && backendTimeSpent > 0) {
        finalTimeSpent = backendTimeSpent;
      } else if (totalTimeSpent <= 0) {
        // If we couldn't calculate a valid time from individual questions, use a fallback
        finalTimeSpent = Math.max(1, questions?.length || 0);
      }

      return {
        score: totalScore,
        maxScore,
        percentage,
        correctAnswers,
        totalQuestions: questions?.length || 0,
        timeSpent: finalTimeSpent,
        passed,
        answers: detailedAnswers,
      };
    },
    [answers, questions, quiz.passingScore],
  );

  return {
    calculateResult,
  };
}
