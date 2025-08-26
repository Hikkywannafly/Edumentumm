"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateQuizPayload,
  GeneratedQuiz,
  QuizCreatorSettings,
  UseQuizSaverReturn,
} from "./quiz-creator-types";

export function useQuizSaver(
  currentQuiz: GeneratedQuiz | null,
): UseQuizSaverReturn {
  const queryClient = useQueryClient();

  // Quiz saving mutation
  const saveQuizMutation = useMutation({
    mutationFn: async ({
      quiz,
      settings,
    }: {
      quiz: GeneratedQuiz;
      settings: QuizCreatorSettings;
    }): Promise<{ id: number }> => {
      const payload: CreateQuizPayload = {
        title: quiz.title,
        description: quiz.description,
        userId: 1, // Get from auth context
        visibility: settings.visibility as any,
        language: settings.language as any,
        questionType: settings.questionType as any,
        numberOfQuestions: settings.numberOfQuestions,
        mode: settings.mode as any,
        difficulty: settings.difficulty as any,
        task: settings.task as any,
        parsingMode: settings.parsingMode as any,
        sourceType: "FILE",
        isAiGenerated: settings.generationMode === "GENERATE",
        generationMode: settings.generationMode,
        fileProcessingMode: settings.fileProcessingMode,
        quizData: {
          questions: quiz.questions.map((q) => ({
            id: q.id,
            text: q.question,
            type: q.type,
            difficulty: q.difficulty,
            points: q.points,
            explanation: q.explanation,
            tags: q.tags,
            options:
              q.answers?.map((a) => ({
                id: a.id,
                text: a.text,
                isCorrect: a.isCorrect,
              })) || [],
          })),
          settings: {
            randomizeQuestions: false,
            showExplanations: true,
            timeLimit: null,
            passingScore: 70,
          },
        },
        tags: quiz.metadata?.tags || [],
        estimatedTime: quiz.metadata?.estimated_time || 15,
        passingScore: 70,
      };

      const response = await fetch("/api/quiz/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save quiz");
      }

      return response.json();
    },
    onSuccess: (result) => {
      // Invalidate quiz list cache
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      // Cache the saved quiz
      queryClient.setQueryData(["quiz", result.id], currentQuiz);
    },
  });

  const saveQuiz = async (
    quiz: GeneratedQuiz,
    settings: QuizCreatorSettings,
  ) => {
    return saveQuizMutation.mutateAsync({ quiz, settings });
  };

  const reset = () => {
    saveQuizMutation.reset();
  };

  return {
    saveQuiz,
    isSaving: saveQuizMutation.isPending,
    error: saveQuizMutation.error,
    reset,
  };
}
