import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import type {
  AutoSaveQuizPayload,
  BackendQuizEntity,
  GeneratedQuiz,
  QuizSettings,
} from "@/types/quiz";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export interface QuizSavePayload {
  quiz: GeneratedQuiz;
  userId: number;
  settings: Partial<QuizSettings>;
  sourceType: "FILE" | "TEXT" | "AI_GENERATED";
  sourceContent?: string;
}

export interface QuizSaveResult {
  success: boolean;
  quiz?: BackendQuizEntity;
  error?: string;
}

export interface QuizSaveOptions {
  onSuccess?: (quiz: BackendQuizEntity) => void;
  onError?: (error: Error) => void;
  settings?: Partial<QuizSettings>;
}

// Query keys
export const quizSaveKeys = {
  all: ["quiz-save"] as const,
  saves: () => [...quizSaveKeys.all, "saves"] as const,
  quiz: (id?: number) => [...quizSaveKeys.all, "quiz", id] as const,
};

export function useQuizSave(options: QuizSaveOptions = {}) {
  const queryClient = useQueryClient();
  const { updateQuizData } = useQuizEditorStore();
  const [error, setError] = useState<string | null>(null);

  // Transform to backend payload
  const transformPayload = useCallback(
    (payload: QuizSavePayload): AutoSaveQuizPayload => {
      const { quiz, userId, settings, sourceType, sourceContent } = payload;

      return {
        title: quiz.title,
        description: quiz.description,
        userId,
        categoryId: quiz.metadata?.category
          ? Number.parseInt(quiz.metadata.category)
          : undefined,
        visibility: settings.visibility || "PRIVATE",
        language: settings.language || "VI",
        questionType: settings.question_type || "MULTIPLE_CHOICE",
        numberOfQuestions: quiz.questions.length,
        mode: settings.mode || "QUIZ",
        difficulty: settings.difficulty || "MEDIUM",
        task: settings.task || "GENERATE_QUIZ",
        parsingMode: settings.parsing_mode || "BALANCED",
        sourceType: sourceType as any,
        sourceContent,
        isAiGenerated: settings.generationMode === "GENERATE",
        aiModel: "openai/gpt-4o-mini",
        generationMode: settings.generationMode || "GENERATE",
        fileProcessingMode: settings.fileProcessingMode || "PARSE_THEN_SEND",
        quizData: {
          questions: quiz.questions,
          settings: quiz.settings || {},
          metadata: quiz.metadata || {},
        },
        tags: quiz.metadata?.tags || [],
        estimatedTime: quiz.metadata?.estimated_time || 10,
        passingScore: settings.passing_score || 70,
      };
    },
    [],
  );

  // Create quiz mutation
  const createMutation = useMutation({
    mutationFn: async (
      payload: QuizSavePayload,
    ): Promise<BackendQuizEntity> => {
      const backendPayload = transformPayload(payload);

      const response = await fetch("/api/quiz/auto-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save quiz");
      }

      const result = await response.json();
      return result.quiz;
    },
    onSuccess: (quiz: BackendQuizEntity) => {
      updateQuizData({
        savedQuizId: quiz.id,
        isAutoSaved: true,
        lastSavedAt: new Date().toISOString(),
      });

      queryClient.setQueryData(quizSaveKeys.quiz(quiz.id), quiz);
      queryClient.invalidateQueries({ queryKey: quizSaveKeys.saves() });

      options.onSuccess?.(quiz);
      console.log("✅ Quiz saved successfully:", quiz.id);
    },
    onError: (error: Error) => {
      console.error("Quiz save failed:", error);
      setError(error.message);
      options.onError?.(error);
    },
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  // Update quiz mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      payload,
      quizId,
    }: {
      payload: QuizSavePayload;
      quizId: number;
    }): Promise<BackendQuizEntity> => {
      const backendPayload = transformPayload(payload);

      const response = await fetch("/api/quiz/auto-save", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...backendPayload, quizId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update quiz");
      }

      const result = await response.json();
      return result.quiz;
    },
    onSuccess: (quiz: BackendQuizEntity) => {
      updateQuizData({
        lastSavedAt: new Date().toISOString(),
      });

      queryClient.setQueryData(quizSaveKeys.quiz(quiz.id), quiz);
      queryClient.invalidateQueries({ queryKey: quizSaveKeys.saves() });

      options.onSuccess?.(quiz);
      console.log("✅ Quiz updated successfully:", quiz.id);
    },
    onError: (error: Error) => {
      console.error("Quiz update failed:", error);
      setError(error.message);
      options.onError?.(error);
    },
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  // Main save function
  const saveQuiz = useCallback(
    async (payload: QuizSavePayload): Promise<QuizSaveResult> => {
      try {
        const result = await createMutation.mutateAsync(payload);
        return { success: true, quiz: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [createMutation],
  );

  // Update existing quiz
  const updateQuiz = useCallback(
    async (
      payload: QuizSavePayload,
      quizId: number,
    ): Promise<QuizSaveResult> => {
      try {
        const result = await updateMutation.mutateAsync({ payload, quizId });
        return { success: true, quiz: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [updateMutation],
  );

  // Save current quiz from store
  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    saveQuiz,
    updateQuiz,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isSaving: createMutation.isPending || updateMutation.isPending,
    error,
    reset,
  };
}
