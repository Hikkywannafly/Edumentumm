import { useAuth } from "@/contexts/auth-context";
import { useQuizCacheStore } from "@/stores/quiz-cache-store";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import type { AutoSaveQuizPayload, BackendQuizEntity } from "@/types/quiz";
import { useCallback, useState } from "react";

interface UseAutoSaveQuizOptions {
  userId?: number;
  enabled?: boolean;
  sourceType?: "FILE" | "TEXT" | "AI_GENERATED";
  onSaveSuccess?: (quizId: number) => void;
}

export function useAutoSaveQuiz(options: UseAutoSaveQuizOptions = {}) {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);
  const [savedQuiz, setSavedQuiz] = useState<BackendQuizEntity | null>(null);

  const { quizData, updateQuizData } = useQuizEditorStore();
  const { accessToken } = useAuth();
  const { cacheQuiz } = useQuizCacheStore();
  const autoSaveQuiz = useCallback(
    async (userSettings?: any): Promise<BackendQuizEntity | null> => {
      if (!options.enabled || !quizData) {
        return null;
      }

      setIsAutoSaving(true);
      setAutoSaveError(null);

      try {
        const payload: AutoSaveQuizPayload = {
          title: quizData.title,
          description: quizData.description,
          userId: options.userId || 1,
          categoryId: quizData.metadata?.category
            ? Number.parseInt(quizData.metadata.category)
            : 1,
          visibility:
            userSettings?.visibility ||
            quizData.settings?.visibility ||
            "PRIVATE",
          language:
            userSettings?.language || quizData.settings?.language || "AUTO",
          questionType:
            userSettings?.questionType ||
            quizData.settings?.question_type ||
            "MULTIPLE_CHOICE",
          numberOfQuestions: quizData.questions.length,
          mode: userSettings?.mode || quizData.settings?.mode || "QUIZ",
          difficulty:
            userSettings?.difficulty ||
            quizData.settings?.difficulty ||
            "MEDIUM",
          task: userSettings?.task || "GENERATE_QUIZ",
          parsingMode:
            userSettings?.parsingMode ||
            quizData.settings?.parsing_mode ||
            "BALANCED",
          sourceType: options.sourceType || "FILE",
          isAiGenerated: true,
          aiModel: userSettings?.aiModel,
          generationMode: userSettings?.generationMode || "GENERATE",
          fileProcessingMode:
            userSettings?.fileProcessingMode || "PARSE_THEN_SEND",
          quizData: {
            questions: quizData.questions,
            settings: quizData.settings || {},
            metadata: quizData.metadata || {},
          },
          tags: quizData.metadata?.tags || [],
          estimatedTime: quizData.metadata?.estimated_time || 10,
          passingScore: 70,
        };

        const response = await fetch("/api/quiz/auto-save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to auto-save quiz");
        }

        const result = await response.json();
        const savedQuizEntity = result.quiz;

        // Cache quiz data sau khi tạo thành công
        cacheQuiz(savedQuizEntity);

        setSavedQuiz(savedQuizEntity);
        updateQuizData({
          savedQuizId: savedQuizEntity.id,
          isAutoSaved: true,
          lastSavedAt: new Date().toISOString(),
        });

        console.log("✅ Quiz auto-saved and cached:", savedQuizEntity.id);

        // Gọi callback nếu có
        if (options.onSaveSuccess && savedQuizEntity.id) {
          options.onSaveSuccess(savedQuizEntity.id);
        }

        return savedQuizEntity;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setAutoSaveError(errorMessage);
        console.error("❌ Auto-save failed:", error);
        return null;
      } finally {
        setIsAutoSaving(false);
      }
    },
    [
      options.enabled,
      options.userId,
      options.sourceType,
      options.onSaveSuccess,
      quizData,
      updateQuizData,
      accessToken,
      cacheQuiz,
    ],
  );

  const canAutoSave = !!quizData && quizData.questions.length > 0;

  return {
    // Functions
    autoSaveQuiz,

    // State
    isAutoSaving,
    autoSaveError,
    savedQuiz,
    canAutoSave,
    autoSaveEnabled: options.enabled,

    // Helpers
    clearError: () => setAutoSaveError(null),
    clearSavedQuiz: () => setSavedQuiz(null),
  };
}
