import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import type { QuizSettings } from "@/types/quiz";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useFileUpload } from "./use-file-upload";
import { useQuizGen } from "./use-quiz-gen";
import { useQuizSave } from "./use-quiz-save";
export interface QuizFlowOptions {
  userId: number;
  settings: Partial<QuizSettings>;
  autoSave?: boolean;
  redirectAfterSave?: boolean;
  redirectPath?: string;
}

export interface QuizFlowResult {
  success: boolean;
  quizId?: number;
  error?: string;
}

export function useQuizFlow(options: QuizFlowOptions) {
  const router = useRouter();

  const fileUpload = useFileUpload();
  const quizGen = useQuizGen({ settings: options.settings });
  const quizSave = useQuizSave({
    onSuccess: (quiz) => {
      if (options.redirectAfterSave) {
        const path = options.redirectPath || `/quizzes/edit?id=${quiz.id}`;
        router.push(path);
      }
    },
    onError: (error) => {
      console.error("Quiz save failed:", error);
    },
  });

  const createQuizFromFiles = useCallback(
    async (
      files: File[],
      settings?: Partial<QuizSettings>,
    ): Promise<QuizFlowResult> => {
      try {
        await fileUpload.uploadFiles(files);

        // Step 2: Get processed content
        const fileContent = fileUpload.getProcessedContent();
        if (!fileContent) {
          throw new Error("No files processed successfully");
        }

        // Step 3: Generate quiz
        const genResult = await quizGen.generateFromFiles(
          fileContent.content,
          fileContent.sourceFiles,
          settings,
        );

        if (!genResult.success || !genResult.quiz) {
          throw new Error(genResult.error || "Quiz generation failed");
        }

        // Step 4: Auto-save (optional)
        if (options.autoSave) {
          const savePayload = {
            quiz: genResult.quiz,
            userId: options.userId,
            settings: { ...options.settings, ...settings },
            sourceType: "FILE" as const,
            sourceContent: fileContent.content,
          };

          const saveResult = await quizSave.saveQuiz(savePayload);

          if (!saveResult.success) {
            console.warn("Auto-save failed:", saveResult.error);
            // Don't fail the entire flow if auto-save fails
          }

          // Step 5: Navigate (handled by quizSave onSuccess callback)
          return {
            success: true,
            quizId: saveResult.quiz?.id,
          };
        }
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [fileUpload, quizGen, quizSave, options],
  );

  // Text-based quiz creation flow
  const createQuizFromText = useCallback(
    async (
      content: string,
      settings?: Partial<QuizSettings>,
    ): Promise<QuizFlowResult> => {
      try {
        // Step 1: Generate quiz from text
        const genResult = await quizGen.generateFromText(content, settings);

        if (!genResult.success || !genResult.quiz) {
          throw new Error(genResult.error || "Quiz generation failed");
        }

        // Step 2: Auto-save (optional)
        if (options.autoSave) {
          const savePayload = {
            quiz: genResult.quiz,
            userId: options.userId,
            settings: { ...options.settings, ...settings },
            sourceType: "TEXT" as const,
            sourceContent: content,
          };

          const saveResult = await quizSave.saveQuiz(savePayload);

          if (!saveResult.success) {
            console.warn("Auto-save failed:", saveResult.error);
          }

          // Step 3: Navigate (handled by quizSave onSuccess callback)
          return {
            success: true,
            quizId: saveResult.quiz?.id,
          };
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [quizGen, quizSave, options],
  );

  // Manual save current quiz
  const saveCurrentQuiz = useCallback(async (): Promise<QuizFlowResult> => {
    const { quizData } = useQuizEditorStore.getState();
    if (!quizData) {
      return { success: false, error: "No quiz data to save" };
    }

    const savePayload = {
      quiz: quizData,
      userId: options.userId,
      settings: options.settings || {},
      sourceType: "AI_GENERATED" as const,
    };

    const result = await quizSave.saveQuiz(savePayload);

    return {
      success: result.success,
      quizId: result.quiz?.id,
      error: result.error,
    };
  }, [quizSave, options.userId, options.settings]);

  const reset = useCallback(() => {
    fileUpload.reset();
    quizGen.reset();
    quizSave.reset();
  }, [fileUpload, quizGen, quizSave]);

  return {
    // Main flow functions
    createQuizFromFiles,
    createQuizFromText,
    saveCurrentQuiz,
    reset,

    // Individual hook access
    fileUpload,
    quizGen,
    quizSave,

    // Combined state
    isProcessing:
      fileUpload.isProcessing || quizGen.isGenerating || quizSave.isSaving,
    isUploading: fileUpload.isProcessing,
    isGenerating: quizGen.isGenerating,
    isSaving: quizSave.isSaving,

    // Combined errors
    error: fileUpload.errors[0]?.error || quizGen.error || quizSave.error,
    hasErrors: fileUpload.hasErrors || !!quizGen.error || !!quizSave.error,

    // Settings
    currentSettings: options.settings,
  };
}
