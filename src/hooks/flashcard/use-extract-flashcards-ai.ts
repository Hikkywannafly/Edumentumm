import { extractFlashcardsWithAIHandler } from "@/lib/services/flashcard-generate.service";
import { useFlashcardEditorStore } from "@/stores/flashcard-editor-store";
import type {
  GeneratedFlashcardSet,
  UploadedFile,
} from "@/stores/flashcard-editor-store";
import type { FlashcardData } from "@/types/flashcard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { flashcardQueryKeys } from "../flashcard-query-keys";
import { useGenerateFlashcardTitleDescription } from "./use-generate-flashcard-title-description";

interface ExtractFlashcardsAIParams {
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

export function useExtractFlashcardsAI() {
  const queryClient = useQueryClient();
  const { setFlashcardData } = useFlashcardEditorStore();
  const titleGenerator = useGenerateFlashcardTitleDescription();

  const extractFlashcardsAIMutation = useMutation({
    mutationFn: async (params: ExtractFlashcardsAIParams) => {
      if (params.source === "text" && params.content) {
        // Extract from text
        const flashcards = await extractFlashcardsWithAIHandler(
          params.content,
          undefined,
          params.settings,
        );
        return { flashcards, source: "text", content: params.content };
      }

      // Extract from files
      const successfulFiles =
        params.files?.filter(
          (f) => f.status === "success" && f.parsedContent,
        ) || [];
      if (successfulFiles.length === 0) throw new Error("No files to process");

      const allFlashcards: FlashcardData[] = [];
      for (const file of successfulFiles) {
        if (file.parsedContent) {
          const flashcards = await extractFlashcardsWithAIHandler(
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
          flashcardQueryKeys.extractFlashcards(
            data.content,
            variables.settings,
          ),
          data.flashcards,
        );
      }

      // Create initial flashcard data
      const title =
        data.source === "text"
          ? "Extracted Flashcards from Text"
          : `Extracted Flashcards from ${data.files?.[0]?.name || "Files"}`;
      const description = `Extracted ${
        Array.isArray(data.flashcards)
          ? data.flashcards.length
          : data.flashcards.flashcards.length
      } flashcards from existing content`;

      const flashcardData: GeneratedFlashcardSet = {
        title,
        description,
        flashcards: Array.isArray(data.flashcards)
          ? data.flashcards
          : data.flashcards.flashcards,
        metadata: {
          total_cards: Array.isArray(data.flashcards)
            ? data.flashcards.length
            : data.flashcards.flashcards.length,
          difficulty: variables.settings?.difficulty || "EASY",
          flashcardType: variables.settings?.flashcardType || "QUESTIONS",
          categoryId: variables.settings?.categoryId,
          estimated_study_time: Math.max(
            5,
            Math.ceil(
              Array.isArray(data.flashcards)
                ? data.flashcards.length * 0.5
                : data.flashcards.flashcards.length * 0.5,
            ),
          ),
          tags: ["extracted", "ai-powered"],
        },
      };
      setFlashcardData(flashcardData);

      // Generate better title with AI (async, non-blocking) - Only for QUESTIONS type
      // VOCABULARY type already includes title/description from API
      if (variables.settings?.flashcardType !== "VOCABULARY") {
        try {
          const contentForTitle =
            data.content || data.files?.[0]?.parsedContent || "";
          await titleGenerator.generateTitleDescription(
            contentForTitle,
            Array.isArray(data.flashcards)
              ? data.flashcards
              : (data.flashcards.flashcards ?? []),
            {
              isExtractMode: true,
              targetLanguage: variables.settings?.language || "vi",
              filename: data.files?.[0]?.name,
            },
          );
        } catch (error) {
          console.warn(
            "⚠️ Failed to generate AI title (using fallback):",
            error,
          );
        }
      } else {
        console.log(
          "📚 Vocabulary extraction - title/description already included from API",
        );
      }
    },
    onError: (error) => {
      console.error("❌ Extract Flashcards AI failed:", error);
    },
    retry: 2,
    retryDelay: 5000,
  });

  return {
    // Main function
    extractFlashcardsAI: extractFlashcardsAIMutation.mutateAsync,

    // State
    isExtracting: extractFlashcardsAIMutation.isPending,
    isSuccess: extractFlashcardsAIMutation.isSuccess,
    isError: extractFlashcardsAIMutation.isError,
    error: extractFlashcardsAIMutation.error,
    data: extractFlashcardsAIMutation.data,

    // Title generation state
    isTitleGenerating: titleGenerator.isGenerating,
    titleError: titleGenerator.error,

    // Control
    reset: () => {
      extractFlashcardsAIMutation.reset();
      titleGenerator.reset();
    },
  };
}
