"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  BackendTag,
  GeneratedQuiz,
  QuizCreatorSettings,
  QuizPayload,
  UseQuizSaverReturn,
} from "./quiz-creator-types";

export function useQuizSaver(): UseQuizSaverReturn {
  const queryClient = useQueryClient();

  // Quiz saving mutation
  const saveQuizMutation = useMutation({
    mutationFn: async ({
      quiz,
      settings,
    }: {
      quiz: GeneratedQuiz;
      settings: QuizCreatorSettings;
    }): Promise<{ id: number; slug?: string; title?: string }> => {
      const transformedTags: BackendTag[] = (quiz.metadata?.tags || []).map(
        (tagName: string) => ({
          name: tagName,
          description: `Auto-generated tag for ${tagName}`,
          icon: "tag",
          color: "#4285F4",
        }),
      );

      const payload: QuizPayload = {
        title: quiz.title,
        description: quiz.description || "",
        thumbnailUrl: undefined,
        difficulty: settings.difficulty as any,
        estimatedTime: quiz.metadata?.estimated_time || 30,
        passingScore: 100,
        maxAttempts: 3,
        isAiGenerated: settings.generationMode === "GENERATE",
        aiModel: settings.generationMode === "GENERATE" ? "GPT-4" : undefined,
        sourceType: "FILE", // Could be dynamic based on settings.sourceType
        metaTitle: quiz.title,
        metaDescription: quiz.description || "",
        canonicalUrl: undefined,
        keywords: quiz.metadata?.tags || [],
        visibility: settings.visibility as any,
        isPremium: false,
        quizData: {
          introduction: `Quiz about ${quiz.title}`,
          instructions:
            "Please read each question carefully and select the best answer.",
          questions: quiz.questions.map((q) => ({
            id: q.id,
            text: q.question,
            type: q.type,
            points: q.points || 1,
            options:
              q.answers?.map((a) => ({
                id: a.id,
                text: a.text,
              })) || [],
            correctAnswer: q.answers?.find((a) => a.isCorrect)?.id || "",
            explanation: q.explanation || "",
          })),
          summary: "Thank you for completing the quiz!",
        },
        tags: transformedTags,
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to save quiz: ${response.status}`,
        );
      }

      const result = await response.json();

      return {
        id: result.id,
        slug: result.slug,
        title: result.title,
      };
    },
    onSuccess: (result) => {
      // Invalidate quiz list cache
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      // Invalidate the specific quiz cache to ensure fresh data is loaded
      queryClient.invalidateQueries({ queryKey: ["quiz", result.id] });
      // Also invalidate the quiz editing cache
      queryClient.invalidateQueries({ queryKey: ["quiz-editing", result.id] });
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
