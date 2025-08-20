import { quizQueryKeys } from "@/hooks/quiz-query-keys";
import { extractQuestionsFromContent } from "@/lib/services/quiz-generate.service";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import type { GeneratedQuiz, UploadedFile } from "@/stores/quiz-editor-store";
import type { Language, ParsingMode, QuestionData } from "@/types/quiz";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ExtractDirectParams {
  source: "files" | "text";
  content?: string;
  files?: UploadedFile[];
  settings?: {
    language?: Language;
    parsingMode?: ParsingMode;
  };
}

export function useExtractQuestionsDirect() {
  const queryClient = useQueryClient();
  const { setQuizData } = useQuizEditorStore();

  const extractQuestionsMutation = useMutation({
    mutationFn: async (params: ExtractDirectParams) => {
      if (params.source === "text" && params.content) {
        // Extract from text
        const questions = await extractQuestionsFromContent(
          params.content,
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
          const questions = await extractQuestionsFromContent(
            file.parsedContent,
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
    onSuccess: (data, variables) => {
      // Cache result
      if (data.source === "text" && data.content) {
        queryClient.setQueryData(
          quizQueryKeys.extractQuestions(data.content, variables.settings),
          data.questions,
        );
      }

      // Create quiz
      const quizData: GeneratedQuiz = {
        title:
          data.source === "text"
            ? "Quiz from Text Content"
            : `Quiz from ${data.files?.[0]?.name || "Files"}`,
        description: `Extracted ${data.questions.length} questions`,
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

      console.log(`✅ Extracted ${data.questions.length} questions directly`);
    },
    onError: (error) => {
      console.error("❌ Extract Questions Direct failed:", error);
    },
  });

  return {
    // Main function
    extractQuestionsDirect: extractQuestionsMutation.mutateAsync,

    // State
    isExtracting: extractQuestionsMutation.isPending,
    isSuccess: extractQuestionsMutation.isSuccess,
    isError: extractQuestionsMutation.isError,
    error: extractQuestionsMutation.error,
    data: extractQuestionsMutation.data,

    // Control
    reset: extractQuestionsMutation.reset,
  };
}
