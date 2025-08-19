import { useToast } from "@/hooks/use-toast";
import { quizCRUDAPI } from "@/lib/api/quiz/crud";
import type { CreateQuizRequest, QuizResponse } from "@/types/quiz";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseCreateQuizOptions {
  onSuccess?: (data: QuizResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateQuiz(options?: UseCreateQuizOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (quizRequest: CreateQuizRequest) =>
      quizCRUDAPI.createQuiz(quizRequest),

    onSuccess: (data: QuizResponse) => {
      // Invalidate and refetch quiz-related queries
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });

      toast({
        title: "Success",
        description: "Quiz created successfully!",
      });

      options?.onSuccess?.(data);
    },

    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create quiz",
        variant: "destructive",
      });

      options?.onError?.(error);
    },
  });
}
