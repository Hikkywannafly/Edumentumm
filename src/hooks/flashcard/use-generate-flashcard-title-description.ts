import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { generateFlashcardTitleDescription } from "../../lib/services/flashcard-generate.service";
import { useFlashcardEditorStore } from "../../stores/flashcard-editor-store";
import type { FlashcardData } from "../../types/flashcard";
import { flashcardQueryKeys } from "../flashcard-query-keys";

interface GenerateFlashcardTitleParams {
  content: string;
  flashcards: FlashcardData[];
  options?: {
    isExtractMode?: boolean;
    targetLanguage?: string;
    filename?: string;
    category?: string;
    tags?: string[];
  };
}

export function useGenerateFlashcardTitleDescription() {
  const queryClient = useQueryClient();
  const { updateFlashcardData } = useFlashcardEditorStore();

  const generateTitleMutation = useMutation({
    mutationFn: async (params: GenerateFlashcardTitleParams) => {
      const result = await generateFlashcardTitleDescription(
        params.content,
        params.flashcards,
        params.options,
      );

      if (!result) {
        throw new Error("Failed to generate title and description");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Update flashcard data with new title and description
      updateFlashcardData({
        title: data.title,
        description: data.description,
      });

      // Cache the result
      queryClient.setQueryData(
        flashcardQueryKeys.titleDescription(
          variables.content,
          variables.flashcards,
          variables.options,
        ),
        data,
      );

      console.log("✅ Generated flashcard title and description:", data);
    },
    onError: (error) => {
      console.error("❌ Failed to generate flashcard title:", error);
    },
  });

  const generateTitleDescription = useCallback(
    async (
      content: string,
      flashcards: FlashcardData[],
      options?: GenerateFlashcardTitleParams["options"],
    ) => {
      return generateTitleMutation.mutateAsync({
        content,
        flashcards,
        options,
      });
    },
    [generateTitleMutation],
  );

  return {
    generateTitleDescription,
    isGenerating: generateTitleMutation.isPending,
    isSuccess: generateTitleMutation.isSuccess,
    isError: generateTitleMutation.isError,
    error: generateTitleMutation.error,
    data: generateTitleMutation.data,
    reset: generateTitleMutation.reset,
  };
}
