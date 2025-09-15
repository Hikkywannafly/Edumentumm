import type { BackendQuestion, BackendQuizEntity } from "@/types/quiz";
import type { QuizAnswer, QuizResult } from "@/types/quiz-take";
import { useCallback } from "react";

interface UseQuizResultsProps {
  quiz: BackendQuizEntity;
  questions: BackendQuestion[];
  answers: QuizAnswer[];
}

interface UseQuizResultsReturn {
  calculateResult: () => QuizResult;
}

export function useQuizResults({
  quiz,
  questions,
  answers,
}: UseQuizResultsProps): UseQuizResultsReturn {
  const calculateResult = useCallback((): QuizResult => {
    let correctAnswers = 0;
    let totalScore = 0;
    const maxScore =
      questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;

    const detailedAnswers = (questions || []).map((question) => {
      const userAnswer = answers.find((a) => a.questionId === question.id);

      // For text-based questions, we need to compare the text content
      // For multiple choice, we compare option IDs
      let isCorrect = false;
      let correctOptionId = "";

      if (question.type === "FILL_BLANK" || question.type === "FREE_RESPONSE") {
        // For text-based questions, we compare the actual text
        // This is a simplified check - in a real implementation, you might want more sophisticated comparison
        const userText =
          userAnswer?.selectedOptionId?.trim().toLowerCase() || "";
        const correctText = question.correctAnswer?.trim().toLowerCase() || "";
        isCorrect = userText === correctText;
        correctOptionId = question.correctAnswer || "";
      } else {
        // For multiple choice questions, compare option IDs
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
    const passed = percentage >= (quiz.passingScore || 70); // Default to 70% if not set

    return {
      score: totalScore,
      maxScore,
      percentage,
      correctAnswers,
      totalQuestions: questions?.length || 0,
      timeSpent: 0, // Set to 0 since we're removing time tracking
      passed,
      answers: detailedAnswers,
    };
  }, [answers, questions, quiz.passingScore]);

  return {
    calculateResult,
  };
}
