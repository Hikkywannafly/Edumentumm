import { quizQueryKeys } from "@/hooks/quiz-query-keys";
import { generateQuizTitleDescription } from "@/lib/services/quiz-generate.service";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import type { QuestionData } from "@/types/quiz";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

interface GenerateTitleParams {
  content: string;
  questions: QuestionData[];
  options?: {
    isExtractMode?: boolean;
    targetLanguage?: string;
    filename?: string;
    category?: string;
    tags?: string[];
  };
}

export function useGenerateTitleDescription() {
  const queryClient = useQueryClient();
  const { updateQuizData } = useQuizEditorStore();

  const generateTitleMutation = useMutation({
    mutationFn: async (params: GenerateTitleParams) => {
      const result = await generateQuizTitleDescription(
        params.content,
        params.questions,
        params.options,
      );

      if (!result) {
        throw new Error("Failed to generate title and description");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Update quiz data with new title and description
      updateQuizData({
        title: data.title,
        description: data.description,
      });

      // Cache the result
      queryClient.setQueryData(
        quizQueryKeys.generateTitle(
          variables.content,
          variables.questions.length,
          variables.options,
        ),
        data,
      );

      console.log(`✅ Generated title: ${data.title}`);
    },
    onError: (error) => {
      console.error("❌ Generate title failed:", error);
    },
  });

  const generateTitleDescription = useCallback(
    async (
      content: string,
      questions: QuestionData[],
      options?: {
        isExtractMode?: boolean;
        targetLanguage?: string;
        filename?: string;
        category?: string;
        tags?: string[];
      },
    ) => {
      return generateTitleMutation.mutateAsync({ content, questions, options });
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
