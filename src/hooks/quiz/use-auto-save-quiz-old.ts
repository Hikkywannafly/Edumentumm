import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import { useQuizSettingsStore } from "@/stores/quiz-setting-store";
import type {
  AutoSaveQuizPayload,
  BackendQuizEntity,
  GeneratedQuiz,
} from "@/types/quiz";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

// Query keys for cache management
export const autoSaveQueryKeys = {
  all: ["auto-save"] as const,
  quiz: (quizId?: number) =>
    [...autoSaveQueryKeys.all, "quiz", quizId] as const,
  saves: () => [...autoSaveQueryKeys.all, "saves"] as const,
};

interface AutoSaveContext {
  previousQuiz?: GeneratedQuiz;
  previousSavedQuiz?: BackendQuizEntity;
}

export function useAutoSaveQuiz() {
  const queryClient = useQueryClient();
  const { quizData, savedQuiz, setSavedQuiz, updateQuizData } =
    useQuizEditorStore();

  const { settings } = useQuizSettingsStore();

  const transformToAutoSavePayload = useCallback(
    (
      quiz: GeneratedQuiz,
      userId: number,
      sourceType = "FILE",
      sourceContent?: string,
    ): AutoSaveQuizPayload => {
      return {
        title: quiz.title,
        description: quiz.description,
        userId,
        categoryId: quiz.metadata?.category
          ? Number.parseInt(quiz.metadata.category)
          : undefined,
        visibility: settings.visibility,
        language: settings.language,
        questionType: settings.questionType,
        numberOfQuestions: quiz.questions.length,
        mode: settings.mode,
        difficulty: settings.difficulty,
        task: settings.task,
        parsingMode: settings.parsingMode,
        sourceType: sourceType as any,
        sourceContent,
        isAiGenerated: settings.generationMode === "GENERATE",
        aiModel: "openai/gpt-4o-mini",
        generationMode: settings.generationMode,
        fileProcessingMode: settings.fileProcessingMode,
        quizData: {
          questions: quiz.questions,
          settings: quiz.settings || {},
          metadata: quiz.metadata || {},
        },
        tags: quiz.metadata?.tags || [],
        estimatedTime: quiz.metadata?.estimated_time || 10,
        passingScore: settings.passingScore,
      };
    },
    [settings],
  );

  // Create new quiz mutation
  const createQuizMutation = useMutation({
    mutationFn: async (
      payload: AutoSaveQuizPayload,
    ): Promise<BackendQuizEntity> => {
      const response = await fetch("/api/quiz/auto-save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to auto-save quiz");
      }

      const result = await response.json();
      return result.quiz;
    },
    onMutate: async (_payload): Promise<AutoSaveContext> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: autoSaveQueryKeys.saves() });

      // Snapshot previous values
      const previousQuiz = quizData || undefined;
      const previousSavedQuiz = savedQuiz || undefined;

      // Optimistically update quiz data
      updateQuizData({
        isAutoSaved: false, // Will be true after success
        lastSavedAt: new Date().toISOString(),
      });

      return { previousQuiz, previousSavedQuiz };
    },
    onSuccess: (savedQuizEntity: BackendQuizEntity) => {
      setSavedQuiz(savedQuizEntity);
      updateQuizData({
        savedQuizId: savedQuizEntity.id,
        isAutoSaved: true,
        lastSavedAt: new Date().toISOString(),
      });

      queryClient.invalidateQueries({ queryKey: autoSaveQueryKeys.saves() });
      queryClient.setQueryData(
        autoSaveQueryKeys.quiz(savedQuizEntity.id),
        savedQuizEntity,
      );

      console.log("✅ Quiz auto-saved successfully:", savedQuizEntity.id);
    },
    onError: (error, _payload, context) => {
      console.error("❌ Auto-save failed:", error);

      // Rollback optimistic updates
      if (context?.previousQuiz) {
        updateQuizData(context.previousQuiz);
      }
      if (context?.previousSavedQuiz) {
        setSavedQuiz(context.previousSavedQuiz);
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Update existing quiz mutation
  const updateQuizMutation = useMutation({
    mutationFn: async ({
      payload,
      quizId,
    }: {
      payload: AutoSaveQuizPayload;
      quizId: number;
    }): Promise<BackendQuizEntity> => {
      const response = await fetch("/api/quiz/auto-save", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload, quizId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update quiz");
      }

      const result = await response.json();
      return result.quiz;
    },
    onMutate: async ({ quizId }): Promise<AutoSaveContext> => {
      await queryClient.cancelQueries({
        queryKey: autoSaveQueryKeys.quiz(quizId),
      });

      const previousQuiz = quizData || undefined;
      const previousSavedQuiz = savedQuiz || undefined;

      // Optimistic update
      updateQuizData({
        lastSavedAt: new Date().toISOString(),
      });

      return { previousQuiz, previousSavedQuiz };
    },
    onSuccess: (updatedQuizEntity: BackendQuizEntity) => {
      setSavedQuiz(updatedQuizEntity);
      updateQuizData({
        lastSavedAt: new Date().toISOString(),
      });

      // Update cache
      queryClient.setQueryData(
        autoSaveQueryKeys.quiz(updatedQuizEntity.id),
        updatedQuizEntity,
      );
      queryClient.invalidateQueries({ queryKey: autoSaveQueryKeys.saves() });

      console.log("✅ Quiz updated successfully:", updatedQuizEntity.id);
    },
    onError: (error, _payload, context) => {
      console.error("❌ Quiz update failed:", error);

      // Rollback
      if (context?.previousQuiz) {
        updateQuizData(context.previousQuiz);
      }
      if (context?.previousSavedQuiz) {
        setSavedQuiz(context.previousSavedQuiz);
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Auto-save function
  const autoSaveQuiz = useCallback(
    async (
      userId: number,
      sourceType = "FILE",
      sourceContent?: string,
    ): Promise<BackendQuizEntity | null> => {
      if (!quizData) {
        console.warn("No quiz data to save");
        return null;
      }

      const payload = transformToAutoSavePayload(
        quizData,
        userId,
        sourceType,
        sourceContent,
      );

      const result = await createQuizMutation.mutateAsync(payload);
      return result;
    },
    [quizData, transformToAutoSavePayload, createQuizMutation],
  );

  // Update saved quiz function
  const updateSavedQuiz = useCallback(
    async (
      userId: number,
      sourceType = "FILE",
      sourceContent?: string,
    ): Promise<BackendQuizEntity | null> => {
      if (!quizData || !savedQuiz?.id) {
        console.warn("No quiz data or saved quiz ID for update");
        return null;
      }

      const payload = transformToAutoSavePayload(
        quizData,
        userId,
        sourceType,
        sourceContent,
      );

      try {
        const result = await updateQuizMutation.mutateAsync({
          payload,
          quizId: savedQuiz.id,
        });
        return result;
      } catch (error) {
        console.error("❌ Auto-save failed:", error);
        return null;
      }
    },
    [quizData, savedQuiz, transformToAutoSavePayload, updateQuizMutation],
  );

  // Background auto-save with debouncing
  const backgroundAutoSave = useCallback(
    async (
      userId: number,
      sourceType = "FILE",
      sourceContent?: string,
      debounceMs = 2000,
    ) => {
      if (!quizData) return;

      // Debounce logic
      const timeoutId = setTimeout(async () => {
        try {
          if (savedQuiz?.id) {
            await updateSavedQuiz(userId, sourceType, sourceContent);
          } else {
            await autoSaveQuiz(userId, sourceType, sourceContent);
          }
        } catch (error) {
          console.error("Background auto-save failed:", error);
        }
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    },
    [quizData, savedQuiz, autoSaveQuiz, updateSavedQuiz],
  );

  return {
    // Main functions
    autoSaveQuiz,
    updateSavedQuiz,
    backgroundAutoSave,

    // Mutation states
    isCreating: createQuizMutation.isPending,
    isUpdating: updateQuizMutation.isPending,
    isAutoSaving: createQuizMutation.isPending || updateQuizMutation.isPending,

    // Error states
    createError: createQuizMutation.error,
    updateError: updateQuizMutation.error,

    // Data states
    savedQuiz,
    canAutoSave: !!quizData && quizData.questions.length > 0,
    canUpdate: !!quizData && !!savedQuiz?.id,

    // Utility functions
    resetMutations: () => {
      createQuizMutation.reset();
      updateQuizMutation.reset();
    },

    // Query client for advanced usage
    queryClient,
  };
}
