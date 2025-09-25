import type { BackendQuestion } from "@/types/quiz";
import type { QuizAnswer } from "@/types/quiz-take";
import { useMemo } from "react";

interface QuestionResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation?: string;
}

interface UseQuestionResultsProps {
  questions: BackendQuestion[];
  answers: QuizAnswer[];
}

interface UseQuestionResultsReturn {
  getQuestionResult: (questionId: string) => QuestionResult | null;
  getAllQuestionResults: () => Record<string, QuestionResult>;
}

export function useQuestionResults({
  questions,
  answers,
}: UseQuestionResultsProps): UseQuestionResultsReturn {
  const questionResults = useMemo(() => {
    const results: Record<string, QuestionResult> = {};

    for (const question of questions) {
      const answer = answers.find((a) => a.questionId === question.id);
      if (answer) {
        let correctAnswer = "";
        let isCorrect = false;

        if (
          question.type === "FILL_BLANK" ||
          question.type === "FREE_RESPONSE"
        ) {
          // For text-based questions, compare the actual text content
          const userText = answer.selectedOptionId?.trim().toLowerCase() || "";
          const correctText =
            question.correctAnswer?.trim().toLowerCase() || "";
          isCorrect = userText === correctText;
          correctAnswer = question.correctAnswer || "";
        } else {
          // For multiple choice questions, compare option IDs
          correctAnswer = question.correctAnswer || "";
          isCorrect = answer.selectedOptionId === correctAnswer;
        }

        results[question.id] = {
          isCorrect,
          correctAnswer,
          explanation: question.explanation,
        };
      }
    }

    return results;
  }, [questions, answers]);

  const getQuestionResult = (questionId: string): QuestionResult | null => {
    return questionResults[questionId] || null;
  };

  const getAllQuestionResults = (): Record<string, QuestionResult> => {
    return questionResults;
  };

  return {
    getQuestionResult,
    getAllQuestionResults,
  };
}
