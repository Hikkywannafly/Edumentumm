import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { FileParserService } from "../lib/services/file-parser.service";
import {
  type GeneratedFlashcardSet,
  type UploadedFile,
  useFlashcardEditorStore,
} from "../stores/flashcard-editor-store";
import { flashcardQueryKeys } from "./flashcard-query-keys";
import { useExtractFlashcardsAI } from "./flashcard/use-extract-flashcards-ai";
import { useGenerateFlashcardsAI } from "./flashcard/use-generate-flashcards-ai";

const fileParser = new FileParserService();

export function useFlashProcessor() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { setFlashcardData, updateFlashcardData, flashcardData } =
    useFlashcardEditorStore();
  const queryClient = useQueryClient();

  // Import specialized hooks
  const generateAI = useGenerateFlashcardsAI();
  const extractAI = useExtractFlashcardsAI();

  // File Processing Mutation with caching
  const processFilesMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const newFiles: UploadedFile[] = files.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
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
                  ? { ...f, status: "processing", progress: 50 }
                  : f,
              ),
            );

            const content = await fileParser.parseFile(files[idx]);

            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === fileInfo.id
                  ? {
                      ...f,
                      status: "success",
                      progress: 100,
                      parsedContent: content,
                      actualFile: files[idx],
                    }
                  : f,
              ),
            );

            // Cache file content
            queryClient.setQueryData(
              flashcardQueryKeys.extractFlashcards(content),
              {
                content,
                timestamp: Date.now(),
              },
            );

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
                      status: "error",
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
          setFlashcardData(null as any);
        }
        return newFiles;
      });

      // Clear cache for removed file
      queryClient.removeQueries({
        queryKey: flashcardQueryKeys.extractFlashcards(fileId),
      });
    },
    [queryClient, setFlashcardData],
  );

  const reset = useCallback(() => {
    setUploadedFiles([]);
    setFlashcardData(null as any);
    generateAI.reset();
    extractAI.reset();

    // Clear all related cache
    queryClient.removeQueries({
      queryKey: ["fileProcessing"],
    });
    queryClient.removeQueries({
      queryKey: ["extractFlashcards"],
    });
  }, [setFlashcardData, generateAI, extractAI, queryClient]);

  // Update flashcard details function
  const updateFlashcardDetails = useCallback(
    (updates: Partial<GeneratedFlashcardSet>) => {
      updateFlashcardData(updates);
    },
    [updateFlashcardData],
  );

  return {
    // State
    uploadedFiles,
    generatedFlashcardSet: flashcardData,

    // File operations
    addFiles,
    removeFile,
    reset,

    extractFromFilesAI: (settings?: any) =>
      extractAI.extractFlashcardsAI({
        source: "files",
        files: uploadedFiles,
        settings,
      }),

    extractFromTextAI: (content: string, settings?: any) =>
      extractAI.extractFlashcardsAI({
        source: "text",
        content,
        settings,
      }),

    generateFromFiles: (settings?: any) =>
      generateAI.generateFlashcardsAI({
        source: "files",
        files: uploadedFiles,
        settings,
      }),

    generateFromText: (content: string, settings?: any) =>
      generateAI.generateFlashcardsAI({
        source: "text",
        content,
        settings,
      }),

    updateFlashcardDetails,

    // Loading states - Aggregated
    isProcessingFiles: processFilesMutation.isPending,
    isExtractingAI: extractAI.isExtracting,
    isGenerating: generateAI.isGenerating,

    // Add title generation loading states
    isTitleGenerating:
      generateAI.isTitleGenerating || extractAI.isTitleGenerating,

    // Combined loading
    isProcessing:
      processFilesMutation.isPending ||
      extractAI.isExtracting ||
      generateAI.isGenerating,

    // Errors - Aggregated
    fileError: processFilesMutation.error,
    extractAIError: extractAI.error,
    generateError: generateAI.error,

    titleError: generateAI.titleError || extractAI.titleError,

    // Computed states
    hasFiles: uploadedFiles.length > 0,
    hasSuccessfulFiles: uploadedFiles.some((f) => f.status === "success"),
    hasGeneratedFlashcardSet: !!flashcardData,
    totalCards: flashcardData?.flashcards?.length || 0,

    // Direct access to specialized hooks (if needed)
    hooks: {
      generateAI,
      extractAI,
    },
  };
}
