import { quizAttemptAPI } from "@/lib/api/quiz-attempt";
import type { AttemptReviewDto } from "@/lib/api/quiz-attempt";
import { useQuery } from "@tanstack/react-query";

interface UseQuizAttemptDetailProps {
  attemptId: string;
  enabled?: boolean;
}

export function useQuizAttemptDetail({
  attemptId,
  enabled = true,
}: UseQuizAttemptDetailProps) {
  return useQuery<AttemptReviewDto>({
    queryKey: ["quiz-attempt-detail", attemptId],
    queryFn: async () => {
      if (!attemptId) {
        throw new Error("Attempt ID is required");
      }

      const numericAttemptId = Number.parseInt(attemptId, 10);
      if (Number.isNaN(numericAttemptId)) {
        throw new Error("Invalid attempt ID");
      }

      return await quizAttemptAPI.getAttemptReview(numericAttemptId);
    },
    enabled: enabled && !!attemptId,
  });
}
