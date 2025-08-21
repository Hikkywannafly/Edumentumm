import { quizQueryKeys } from "@/hooks/quiz-query-keys";
import { useExtractQuestionsAI } from "@/hooks/quiz/use-extract-questions-ai";
import { useExtractQuestionsDirect } from "@/hooks/quiz/use-extract-questions-direct";
import { useGenerateQuestionsAI } from "@/hooks/quiz/use-generate-questions-ai";
import { FileParserService } from "@/lib/services/file-parser.service";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import type { GeneratedQuiz, UploadedFile } from "@/stores/quiz-editor-store";
import type {
  AutoSaveQuizPayload,
  BackendQuizEntity,
  Language,
  ParsingMode,
} from "@/types/quiz";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

const fileParser = new FileParserService();

interface QuizProcessorOptions {
  userId?: number;
  autoSave?: boolean;
  sourceType?: "FILE" | "TEXT" | "AI_GENERATED";
}

export function useQuizProcessor(options: QuizProcessorOptions = {}) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);
  const [savedQuiz, setSavedQuiz] = useState<BackendQuizEntity | null>(null);

  const { setQuizData, updateQuizData, quizData } = useQuizEditorStore();
  const queryClient = useQueryClient();

  // Import specialized hooks
  const extractAI = useExtractQuestionsAI();
  const generateAI = useGenerateQuestionsAI();
  const extractDirect = useExtractQuestionsDirect();

  // File Processing Mutation with caching
  const processFilesMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const newFiles: UploadedFile[] = files.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        file: file,
        status: "uploading",
        progress: 0,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      const processedFiles = await Promise.all(
        newFiles.map(async (fileInfo, idx) => {
          try {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === fileInfo.id
                  ? { ...f, status: "processing" as const, progress: 50 }
                  : f,
              ),
            );

            const content = await fileParser.parseFile(files[idx]);

            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === fileInfo.id
                  ? {
                      ...f,
                      status: "success" as const,
                      progress: 100,
                      parsedContent: content,
                      actualFile: files[idx],
                    }
                  : f,
              ),
            );
            queryClient.setQueryData(quizQueryKeys.fileContent(fileInfo.id), {
              content,
              timestamp: Date.now(),
            });

            return {
              ...fileInfo,
              parsedContent: content,
              actualFile: files[idx],
            };
          } catch (error) {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === fileInfo.id
                  ? {
                      ...f,
                      status: "error" as const,
                      error:
                        error instanceof Error
                          ? error.message
                          : "Unknown error",
                    }
                  : f,
              ),
            );
            throw error;
          }
        }),
      );

      return processedFiles;
    },
    onSuccess: (data) => {
      console.log(`✅ Successfully processed ${data.length} files`);
    },
    onError: (error) => {
      console.error("❌ File processing failed:", error);
    },
  });

  // Helper functions
  const addFiles = useCallback(
    (files: File[]) => {
      return processFilesMutation.mutateAsync(files);
    },
    [processFilesMutation],
  );

  const removeFile = useCallback(
    (fileId: string) => {
      setUploadedFiles((prev) => {
        const newFiles = prev.filter((f) => f.id !== fileId);
        if (newFiles.length === 0) {
          setQuizData(null as any);
        }
        return newFiles;
      });

      // Clear cache for removed file
      queryClient.removeQueries({
        queryKey: quizQueryKeys.fileContent(fileId),
      });
    },
    [queryClient, setQuizData],
  );

  const reset = useCallback(() => {
    setUploadedFiles([]);
    setQuizData(null as any);
    extractAI.reset();
    generateAI.reset();
    extractDirect.reset();

    // Clear all related cache
    queryClient.removeQueries({
      queryKey: ["fileProcessing"],
    });
    queryClient.removeQueries({
      queryKey: ["fileContent"],
    });
  }, [setQuizData, extractAI, generateAI, extractDirect, queryClient]);

  // Auto-save function
  const autoSaveQuiz = useCallback(
    async (sourceContent?: string): Promise<BackendQuizEntity | null> => {
      if (!options.autoSave || !options.userId || !quizData) {
        return null;
      }

      setIsAutoSaving(true);
      setAutoSaveError(null);

      try {
        const payload: AutoSaveQuizPayload = {
          title: quizData.title,
          description: quizData.description,
          userId: options.userId,
          categoryId: quizData.metadata?.category
            ? Number.parseInt(quizData.metadata.category)
            : undefined,
          visibility: "PRIVATE",
          language: "AUTO",
          questionType: "MULTIPLE_CHOICE",
          numberOfQuestions: quizData.questions.length,
          mode: "QUIZ",
          difficulty: "MEDIUM",
          task: "GENERATE_QUIZ",
          parsingMode: "BALANCED",
          sourceType: options.sourceType || "FILE",
          sourceContent,
          isAiGenerated: true,
          aiModel: "openai/gpt-4o-mini",
          generationMode: "GENERATE",
          fileProcessingMode: "PARSE_THEN_SEND",
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
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to auto-save quiz");
        }

        const result = await response.json();
        const savedQuizEntity = result.quiz;

        setSavedQuiz(savedQuizEntity);
        updateQuizData({
          savedQuizId: savedQuizEntity.id,
          isAutoSaved: true,
          lastSavedAt: new Date().toISOString(),
        });

        console.log("✅ Quiz auto-saved successfully:", savedQuizEntity.id);
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
      options.autoSave,
      options.userId,
      options.sourceType,
      quizData,
      updateQuizData,
    ],
  );

  // Enhanced generation functions with auto-save
  const generateFromFilesWithAutoSave = useCallback(
    async (settings?: any) => {
      const result = await generateAI.generateQuestionsAI({
        source: "files",
        files: uploadedFiles,
        settings,
      });

      // Auto-save immediately after generation
      if (options.autoSave && options.userId) {
        // Wait for quizData to be updated
        setTimeout(async () => {
          const sourceContent = uploadedFiles
            .filter((f) => f.parsedContent)
            .map((f) => f.parsedContent)
            .join("\n\n--- FILE SEPARATOR ---\n\n");

          await autoSaveQuiz(sourceContent);
        }, 100);
      }

      return result;
    },
    [generateAI, uploadedFiles, options.autoSave, options.userId, autoSaveQuiz],
  );

  const extractFromFilesAIWithAutoSave = useCallback(
    async (settings?: any) => {
      const result = await extractAI.extractQuestionsAI({
        source: "files",
        files: uploadedFiles,
        settings,
      });

      // Auto-save immediately after extraction
      if (options.autoSave && options.userId) {
        // Wait for quizData to be updated
        setTimeout(async () => {
          const sourceContent = uploadedFiles
            .filter((f) => f.parsedContent)
            .map((f) => f.parsedContent)
            .join("\n\n--- FILE SEPARATOR ---\n\n");

          await autoSaveQuiz(sourceContent);
        }, 100);
      }

      return result;
    },
    [extractAI, uploadedFiles, options.autoSave, options.userId, autoSaveQuiz],
  );

  // Update quiz details function
  const updateQuizDetails = useCallback(
    (updates: Partial<GeneratedQuiz>) => {
      updateQuizData(updates);
    },
    [updateQuizData],
  );

  return {
    // State
    uploadedFiles,
    generatedQuiz: quizData,

    // File operations
    addFiles,
    removeFile,
    reset,

    extractFromFiles: (settings?: {
      language?: Language;
      parsingMode?: ParsingMode;
    }) =>
      extractDirect.extractQuestionsDirect({
        source: "files",
        files: uploadedFiles,
        settings,
      }),

    extractFromText: (
      content: string,
      settings?: { language?: Language; parsingMode?: ParsingMode },
    ) =>
      extractDirect.extractQuestionsDirect({
        source: "text",
        content,
        settings,
      }),

    extractFromFilesAI: (settings?: any) =>
      extractAI.extractQuestionsAI({
        source: "files",
        files: uploadedFiles,
        settings,
      }),

    extractFromTextAI: (content: string, settings?: any) =>
      extractAI.extractQuestionsAI({ source: "text", content, settings }),

    generateFromFiles: (settings?: any) =>
      generateAI.generateQuestionsAI({
        source: "files",
        files: uploadedFiles,
        settings,
      }),

    generateFromText: (content: string, settings?: any) =>
      generateAI.generateQuestionsAI({ source: "text", content, settings }),

    // Enhanced functions with auto-save
    generateFromFilesWithAutoSave,
    extractFromFilesAIWithAutoSave,
    autoSaveQuiz,

    updateQuizDetails,

    // Loading states - Aggregated
    isProcessingFiles: processFilesMutation.isPending,
    isExtracting: extractDirect.isExtracting,
    isExtractingAI: extractAI.isExtracting,
    isGenerating: generateAI.isGenerating,
    isAutoSaving,

    // Add title generation loading states
    isTitleGenerating:
      extractAI.isTitleGenerating || generateAI.isTitleGenerating,

    // Combined loading
    isProcessing:
      processFilesMutation.isPending ||
      extractDirect.isExtracting ||
      extractAI.isExtracting ||
      generateAI.isGenerating ||
      extractAI.isTitleGenerating ||
      generateAI.isTitleGenerating ||
      isAutoSaving,

    // Errors - Aggregated
    fileError: processFilesMutation.error,
    extractError: extractDirect.error,
    extractAIError: extractAI.error,
    generateError: generateAI.error,
    autoSaveError,

    //  Add title generation errors
    titleError: extractAI.titleError || generateAI.titleError,

    // Computed states
    hasFiles: uploadedFiles.length > 0,
    hasSuccessfulFiles: uploadedFiles.some((f) => f.status === "success"),

    // Add missing computed states
    hasGeneratedQuiz: !!quizData,
    totalQuestions: quizData?.questions?.length || 0,
    totalPoints:
      quizData?.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0,

    // Auto-save state
    savedQuiz,
    canAutoSave: !!quizData && quizData.questions.length > 0,
    autoSaveEnabled: options.autoSave,

    // Direct access to specialized hooks (if needed)
    hooks: {
      extractAI,
      generateAI,
      extractDirect,
    },
  };
}
