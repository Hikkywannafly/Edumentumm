"use client";

import type {
  GeneratedQuiz,
  QuestionData,
  UpdateQuizData,
  UseQuestionManagerReturn,
} from "./quiz-editor-types";

export function useQuestionManager(
  quiz: GeneratedQuiz | null,
  updateQuiz: (updates: UpdateQuizData) => Promise<void>,
): UseQuestionManagerReturn {
  const addQuestion = (question: QuestionData) => {
    if (!quiz) return;

    const updatedQuestions = [...quiz.questions, question];
    updateQuiz({
      questions: updatedQuestions,
      metadata: {
        ...quiz.metadata,
        total_questions: updatedQuestions.length,
        total_points: updatedQuestions.reduce(
          (sum, q) => sum + (q.points || 1),
          0,
        ),
      },
    });
  };

  const updateQuestion = (
    questionId: string,
    updates: Partial<QuestionData>,
  ) => {
    if (!quiz) return;

    const updatedQuestions = quiz.questions.map((q) =>
      q.id === questionId ? { ...q, ...updates } : q,
    );

    updateQuiz({
      questions: updatedQuestions,
      metadata: {
        ...quiz.metadata,
        total_questions: updatedQuestions.length,
        total_points: updatedQuestions.reduce(
          (sum, q) => sum + (q.points || 1),
          0,
        ),
      },
    });
  };

  const deleteQuestion = (questionId: string) => {
    if (!quiz) return;

    const updatedQuestions = quiz.questions.filter((q) => q.id !== questionId);
    updateQuiz({
      questions: updatedQuestions,
      metadata: {
        ...quiz.metadata,
        total_questions: updatedQuestions.length,
        total_points: updatedQuestions.reduce(
          (sum, q) => sum + (q.points || 1),
          0,
        ),
      },
    });
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    if (!quiz) return;

    const updatedQuestions = [...quiz.questions];
    const [movedQuestion] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, movedQuestion);

    updateQuiz({ questions: updatedQuestions });
  };

  return {
    addQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
  };
}
