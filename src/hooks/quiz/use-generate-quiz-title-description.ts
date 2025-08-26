import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { generateQuizTitleDescription } from "../../lib/services/quiz-generate.service";
import { useQuizEditorStore } from "../../stores/quiz-editor-store";
import type { QuestionData } from "../../types/quiz";
import { quizQueryKeys } from "../quiz-query-keys";

interface GenerateQuizTitleParams {
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

export function useGenerateQuizTitleDescription() {
  const queryClient = useQueryClient();
  const { updateQuizData } = useQuizEditorStore();

  const generateTitleMutation = useMutation({
    mutationFn: async (params: GenerateQuizTitleParams) => {
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
      updateQuizData({
        title: data.title,
        description: data.description,
      });

      queryClient.setQueryData(
        quizQueryKeys.titleDescription(
          variables.content,
          variables.questions,
          variables.options,
        ),
        data,
      );

      console.log(" Generated quiz title and description:", data);
    },
    onError: (error) => {
      console.error("Failed to generate quiz title:", error);
    },
  });

  const generateTitleDescription = useCallback(
    async (
      content: string,
      questions: QuestionData[],
      options?: GenerateQuizTitleParams["options"],
    ) => {
      return generateTitleMutation.mutateAsync({
        content,
        questions,
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
