import { quizAttemptAPI } from "@/lib/api/quiz-attempt";
import type {
  AttemptReviewDto,
  SubmitAttemptRequest,
} from "@/lib/api/quiz-attempt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation<
    AttemptReviewDto,
    Error,
    { quizId: number; data: SubmitAttemptRequest }
  >({
    mutationFn: ({ quizId, data }) =>
      quizAttemptAPI.submitAttempt(quizId, data),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["quiz-attempts", data.quizId],
      });
    },
  });
}

export function useQuizAttemptReview(attemptId: number | undefined) {
  return useQuery<AttemptReviewDto, Error>({
    queryKey: ["quiz-attempt", attemptId],
    queryFn: () => {
      if (!attemptId) throw new Error("Attempt ID is required");
      return quizAttemptAPI.getAttemptReview(attemptId);
    },
    enabled: !!attemptId,
  });
}

export function useLatestQuizAttempt(quizId: number | undefined) {
  return useQuery<AttemptReviewDto, Error>({
    queryKey: ["quiz-attempts", quizId, "latest"],
    queryFn: () => {
      if (!quizId) throw new Error("Quiz ID is required");
      return quizAttemptAPI.getLatestAttempt(quizId);
    },
    enabled: !!quizId,
  });
}
