import { quizQueryKeys } from "@/hooks/quiz-query-keys";
import { useExtractQuestionsAI } from "@/hooks/quiz/use-extract-questions-ai";
import { useExtractQuestionsDirect } from "@/hooks/quiz/use-extract-questions-direct";
import { useGenerateQuestionsAI } from "@/hooks/quiz/use-generate-questions-ai";
import { FileParserService } from "@/lib/services/file-parser.service";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import type { GeneratedQuiz, UploadedFile } from "@/stores/quiz-editor-store";
import type { Language, ParsingMode } from "@/types/quiz";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

const fileParser = new FileParserService();

export function useQuizProcessor() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const { setQuizData, updateQuizData, quizData } = useQuizEditorStore();
  const queryClient = useQueryClient();

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

    updateQuizDetails,

    // Loading states - Aggregated
    isProcessingFiles: processFilesMutation.isPending,
    isExtracting: extractDirect.isExtracting,
    isExtractingAI: extractAI.isExtracting,
    isGenerating: generateAI.isGenerating,

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
      generateAI.isTitleGenerating,

    // Errors - Aggregated
    fileError: processFilesMutation.error,
    extractError: extractDirect.error,
    extractAIError: extractAI.error,
    generateError: generateAI.error,

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

    // Direct access to specialized hooks (if needed)
    hooks: {
      extractAI,
      generateAI,
      extractDirect,
    },
  };
}
