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
    numberOfCards?: string;
    difficulty?: string;
    generationMode?: "GENERATE" | "EXTRACT";
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
      const title =
        data.source === "text"
          ? "AI Generated Flashcards from Text"
          : `AI Generated Flashcards from ${data.files?.[0]?.name || "Files"}`;
      const description = `Generated ${Array.isArray(data.flashcards) ? data.flashcards.length : 0} flashcards using AI`;

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

      const generatedCount = Array.isArray(data.flashcards)
        ? data.flashcards.length
        : (data.flashcards.flashcards?.length ?? 0);
      console.log(`✅ Generated ${generatedCount} flashcards using AI`);

      // Generate better title with AI (async, non-blocking)
      try {
        const contentForTitle =
          data.content || data.files?.[0]?.parsedContent || "";
        await titleGenerator.generateTitleDescription(
          contentForTitle,
          Array.isArray(data.flashcards)
            ? data.flashcards
            : (data.flashcards.flashcards ?? []),
          {
            isExtractMode: variables.settings?.generationMode === "EXTRACT",
            targetLanguage: variables.settings?.language || "vi",
            filename: data.files?.[0]?.name,
          },
        );
      } catch (error) {
        console.warn("⚠️ Failed to generate AI title (using fallback):", error);
      }
    },
    onError: (error) => {
      console.error("❌ Generate Flashcards AI failed:", error);
    },
    retry: 2,
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
