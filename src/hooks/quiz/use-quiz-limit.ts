import { apiClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

interface QuizLimitData {
  canCreateQuiz: boolean;
  quizzesCreatedThisWeek: number;
  weeklyLimit: number;
}

export function useQuizLimit() {
  return useQuery<QuizLimitData>({
    queryKey: ["quiz-limit"],
    queryFn: async () => {
      const response = await apiClient.get("/student/quizzes/limit");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
