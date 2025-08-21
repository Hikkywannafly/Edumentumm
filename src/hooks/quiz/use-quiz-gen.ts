import { generateQuizFromContent } from "@/lib/services/quiz-generate.service";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import type { GeneratedQuiz, QuizSettings } from "@/types/quiz";
import { useCallback, useState } from "react";

export interface QuizGenOptions {
  settings: Partial<QuizSettings>;
}

export interface QuizGenResult {
  success: boolean;
  quiz?: GeneratedQuiz;
  error?: string;
}

export function useQuizGen(options: QuizGenOptions = { settings: {} }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setQuizData } = useQuizEditorStore();

  // Generate from file content - delegated to service
  const generateFromContent = useCallback(
    async (
      content: string,
      sourceFiles: string[] = ["unknown"],
      settings?: Partial<QuizSettings>,
    ): Promise<QuizGenResult> => {
      setIsGenerating(true);
      setError(null);

      try {
        const mergedSettings = { ...options.settings, ...settings };

        const quiz = await generateQuizFromContent(
          content,
          sourceFiles,
          mergedSettings,
        );

        setQuizData(quiz);
        return { success: true, quiz };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsGenerating(false);
      }
    },
    [options.settings, setQuizData],
  );

  // Generate from text content
  const generateFromText = useCallback(
    async (
      textContent: string,
      settings?: Partial<QuizSettings>,
    ): Promise<QuizGenResult> => {
      return generateFromContent(textContent, ["text-input"], settings);
    },
    [generateFromContent],
  );

  // Generate from files
  const generateFromFiles = useCallback(
    async (
      fileContent: string,
      sourceFiles: string[],
      settings?: Partial<QuizSettings>,
    ): Promise<QuizGenResult> => {
      return generateFromContent(fileContent, sourceFiles, settings);
    },
    [generateFromContent],
  );

  const reset = useCallback(() => {
    setError(null);
    setIsGenerating(false);
  }, []);

  return {
    // Core functions
    generateFromContent,
    generateFromText,
    generateFromFiles,
    reset,

    // State
    isGenerating,
    error,

    // Utils
    canGenerate: !isGenerating,
  };
}
