import { quizQueryKeys } from "@/hooks/quiz-query-keys";
import { extractQuestionsWithAIHandler } from "@/lib/services/quiz-generate.service";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import type { GeneratedQuiz, UploadedFile } from "@/stores/quiz-editor-store";
import type { ParsingMode, QuestionData } from "@/types/quiz";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGenerateTitleDescription } from "./use-generate-title-description";

interface ExtractAIParams {
  source: "files" | "text";
  content?: string;
  files?: UploadedFile[];
  settings?: {
    language?: string;
    numberOfQuestions?: number;
    parsingMode?: ParsingMode;
    [key: string]: any;
  };
}

export function useExtractQuestionsAI() {
  const queryClient = useQueryClient();
  const { setQuizData } = useQuizEditorStore();
  const titleGenerator = useGenerateTitleDescription();

  const extractQuestionsAIMutation = useMutation({
    mutationFn: async (params: ExtractAIParams) => {
      if (params.source === "text" && params.content) {
        // Extract from text
        const questions = await extractQuestionsWithAIHandler(
          params.content,
          undefined,
          params.settings,
        );
        return { questions, source: "text", content: params.content };
      }

      // Extract from files
      const successfulFiles =
        params.files?.filter(
          (f) => f.status === "success" && f.parsedContent,
        ) || [];
      if (successfulFiles.length === 0) throw new Error("No files to process");

      const allQuestions: QuestionData[] = [];
      for (const file of successfulFiles) {
        if (file.parsedContent) {
          const questions = await extractQuestionsWithAIHandler(
            file.parsedContent,
            file.actualFile,
            params.settings,
          );
          allQuestions.push(...questions);
        }
      }
      return {
        questions: allQuestions,
        source: "files",
        files: successfulFiles,
      };
    },
    onSuccess: async (data, variables) => {
      // Cache result
      if (data.source === "text" && data.content) {
        queryClient.setQueryData(
          quizQueryKeys.extractQuestionsAI(data.content, variables.settings),
          data.questions,
        );
      }

      // Create initial quiz data
      const title =
        data.source === "text"
          ? "AI Extracted Quiz from Text"
          : `AI Extracted Quiz from ${data.files?.[0]?.name || "Files"}`;
      const description = `Extracted ${data.questions.length} questions using AI`;

      const quizData: GeneratedQuiz = {
        title,
        description,
        questions: data.questions,
        metadata: {
          total_questions: data.questions.length,
          total_points: data.questions.reduce(
            (sum, q) => sum + (q.points || 1),
            0,
          ),
          estimated_time: Math.max(5, Math.ceil(data.questions.length * 1.5)),
          tags: [],
        },
      };
      setQuizData(quizData);

      // Generate better title with AI (async, non-blocking)
      try {
        const contentForTitle =
          data.content || data.files?.[0]?.parsedContent || "";
        await titleGenerator.generateTitleDescription(
          contentForTitle,
          data.questions,
          {
            isExtractMode: true,
            targetLanguage: variables.settings?.language || "vi",
            filename: data.files?.[0]?.name,
          },
        );
      } catch (error) {
        console.warn("⚠️ Failed to generate AI title (using fallback):", error);
      }
    },
    onError: (error) => {
      console.error("❌ Extract Questions AI failed:", error);
    },
    retry: 2,
    retryDelay: 3000,
  });

  return {
    // Main function
    extractQuestionsAI: extractQuestionsAIMutation.mutateAsync,

    // State
    isExtracting: extractQuestionsAIMutation.isPending,
    isSuccess: extractQuestionsAIMutation.isSuccess,
    isError: extractQuestionsAIMutation.isError,
    error: extractQuestionsAIMutation.error,
    data: extractQuestionsAIMutation.data,

    // Title generation state
    isTitleGenerating: titleGenerator.isGenerating,
    titleError: titleGenerator.error,

    // Control
    reset: () => {
      extractQuestionsAIMutation.reset();
      titleGenerator.reset();
    },
  };
}
