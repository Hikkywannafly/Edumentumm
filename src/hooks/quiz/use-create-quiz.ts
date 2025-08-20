import { QUIZ_QUERY_KEYS } from "@/hooks/quiz/use-quiz";
import { quizCRUDAPI } from "@/lib/api/quiz/";
import type { CreateQuizRequest, QuizResponse } from "@/types/quiz";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface UseCreateQuizOptions {
  onSuccess?: (data: QuizResponse) => void;
  onError?: (error: Error) => void;
  redirectToEdit?: boolean;
}

export function useCreateQuiz(options: UseCreateQuizOptions = {}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { onSuccess, onError, redirectToEdit = true } = options;

  return useMutation<QuizResponse, Error, CreateQuizRequest>({
    mutationFn: (data) => quizCRUDAPI.createQuiz(data),

    onSuccess: (data) => {
      queryClient.setQueryData(QUIZ_QUERY_KEYS.detail(data.id), data);

      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.lists(),
      });

      onSuccess?.(data);

      if (redirectToEdit) {
        router.push(`/quizzes/edit?id=${data.id}`);
      }
    },
    onError: (error) => {
      console.error("Error creating quiz:", error);
      onError?.(error);
    },
  });
}
