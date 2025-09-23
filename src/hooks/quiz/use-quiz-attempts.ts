import { quizAttemptAPI } from "@/lib/api/quiz-attempt";
import type { AttemptListItemDto } from "@/lib/api/quiz-attempt";
import { useQuery } from "@tanstack/react-query";

interface UseQuizAttemptsProps {
  quizId: string;
  enabled?: boolean;
}

export function useQuizAttempts({
  quizId,
  enabled = true,
}: UseQuizAttemptsProps) {
  return useQuery<AttemptListItemDto[]>({
    queryKey: ["quiz-attempts", quizId],
    queryFn: async () => {
      if (!quizId) return [];
      const numericQuizId = Number.parseInt(quizId, 10);
      if (Number.isNaN(numericQuizId)) return [];

      return await quizAttemptAPI.getQuizAttempts(numericQuizId);
    },
    enabled: enabled && !!quizId,
  });
}
