import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateFlashcardsWithAI } from "../../lib/services/flashcard-generate.service";
import { useFlashcardEditorStore } from "../../stores/flashcard-editor-store";
import type {
  GeneratedFlashcardSet,
  UploadedFile,
} from "../../stores/flashcard-editor-store";
import type { FlashcardData } from "../../types/flashcard";
import { flashcardQueryKeys } from "../flashcard-query-keys";
import { useGenerateFlashcardTitleDescription } from "./use-generate-flashcard-title-description";

interface GenerateFlashcardsAIParams {
  source: "files" | "text";
  content?: string;
  files?: UploadedFile[];
  settings?: {
    language?: string;
    numberOfCards?: number;
    difficulty?: string;
    generationMode?: "GENERATE" | "EXTRACT";
    flashcardType?: "QUESTIONS" | "VOCABULARY";
    fileProcessing?: string;
    parsingMode?: string;
    [key: string]: any;
  };
}

export function useGenerateFlashcardsAI() {
  const queryClient = useQueryClient();
  const { setFlashcardData } = useFlashcardEditorStore();
  const titleGenerator = useGenerateFlashcardTitleDescription();

  const generateFlashcardsAIMutation = useMutation({
    mutationFn: async (params: GenerateFlashcardsAIParams) => {
      if (params.source === "text" && params.content) {
        // Generate from text
        const flashcards = await generateFlashcardsWithAI(
          params.content,
          undefined,
          params.settings,
        );
        return {
          flashcards: flashcards,
          source: "text",
          content: params.content,
        };
      }

      // Generate from files
      const successfulFiles =
        params.files?.filter(
          (f) => f.status === "success" && f.parsedContent,
        ) || [];
      if (successfulFiles.length === 0) throw new Error("No files to process");

      const allFlashcards: FlashcardData[] = [];
      for (const file of successfulFiles) {
        if (file.parsedContent) {
          const flashcards = await generateFlashcardsWithAI(
            file.parsedContent,
            file.actualFile,
            params.settings,
          );
          allFlashcards.push(...flashcards.flashcards);
        }
      }
      return {
        flashcards: allFlashcards,
        source: "files",
        files: successfulFiles,
      };
    },
    onSuccess: async (data, variables) => {
      // Cache result
      if (data.source === "text" && data.content) {
        queryClient.setQueryData(
          flashcardQueryKeys.generateFlashcards(
            data.content,
            variables.settings,
          ),
          data.flashcards,
        );
      }

      // Create initial flashcard data
      // For VOCABULARY type, use title/description from API response
      // For QUESTIONS type, use temporary title (will be updated by AI generation)
      const hasApiTitleDesc =
        !Array.isArray(data.flashcards) &&
        typeof data.flashcards === "object" &&
        "title" in data.flashcards;

      const title = hasApiTitleDesc
        ? (data.flashcards as any).title
        : data.source === "text"
          ? "AI Generated Flashcards from Text"
          : `AI Generated Flashcards from ${data.files?.[0]?.name || "Files"}`;

      const description = hasApiTitleDesc
        ? (data.flashcards as any).description
        : `Generated ${Array.isArray(data.flashcards) ? data.flashcards.length : 0} flashcards using AI`;

      const flashcardData: GeneratedFlashcardSet = {
        title,
        description,
        flashcards: Array.isArray(data.flashcards)
          ? data.flashcards
          : (data.flashcards.flashcards ?? []),
        metadata: {
          total_cards: Array.isArray(data.flashcards)
            ? data.flashcards.length
            : (data.flashcards.flashcards?.length ?? 0),
          difficulty: variables.settings?.difficulty || "EASY",
          flashcardType: variables.settings?.flashcardType || "QUESTIONS",
          categoryId: variables.settings?.categoryId,
          estimated_study_time: Math.max(
            5,
            Math.ceil(
              Array.isArray(data.flashcards)
                ? data.flashcards.length * 0.5
                : (data.flashcards.flashcards?.length ?? 0) * 0.5,
            ),
          ),
          tags: [],
        },
      };
      setFlashcardData(flashcardData);

      // Generate better title with AI (async, non-blocking) - For both QUESTIONS and VOCABULARY types
      try {
        const contentForTitle =
          data.content || data.files?.[0]?.parsedContent || "";
        const flashcardsForTitle = Array.isArray(data.flashcards)
          ? data.flashcards
          : (data.flashcards.flashcards ?? []);

        // Always generate AI title/description for better quality
        await titleGenerator.generateTitleDescription(
          contentForTitle,
          flashcardsForTitle,
          {
            isExtractMode: variables.settings?.generationMode === "EXTRACT",
            targetLanguage: variables.settings?.language || "vi",
            filename: data.files?.[0]?.name,
            category:
              variables.settings?.flashcardType === "VOCABULARY"
                ? "Vocabulary"
                : undefined,
          },
        );
      } catch (error) {
        console.warn("⚠️ Failed to generate AI title (using fallback):", error);
      }
    },
    onError: (error) => {
      console.error("❌ Generate Flashcards AI failed:", error);
    },
    retry: (failureCount, error: any) => {
      // Don't retry on rate limit errors (429)
      if (error?.response?.status === 429 || error?.status === 429) {
        console.log(
          "🚫 Skipping retry for 429 rate limit error in main flashcard generation",
        );
        return false;
      }
      // Don't retry on auth errors (401, 403)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log(
          "🚫 Skipping retry for auth error in main flashcard generation",
        );
        return false;
      }
      // Only retry on network errors, max 2 times
      const shouldRetry = failureCount < 2;
      console.log(
        `${shouldRetry ? "✅" : "🚫"} Retry decision: ${shouldRetry} (attempt ${failureCount + 1})`,
      );
      return shouldRetry;
    },
    retryDelay: 5000,
  });

  return {
    // Main function
    generateFlashcardsAI: generateFlashcardsAIMutation.mutateAsync,

    // State
    isGenerating: generateFlashcardsAIMutation.isPending,
    isSuccess: generateFlashcardsAIMutation.isSuccess,
    isError: generateFlashcardsAIMutation.isError,
    error: generateFlashcardsAIMutation.error,
    data: generateFlashcardsAIMutation.data,

    // Title generation state
    isTitleGenerating: titleGenerator.isGenerating,
    titleError: titleGenerator.error,

    // Control
    reset: () => {
      generateFlashcardsAIMutation.reset();
      titleGenerator.reset();
    },
  };
}
