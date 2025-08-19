import { quizCRUDAPI } from "@/lib/api/quiz";
import type { QuizResponse } from "@/types/quiz";
import { useQuery } from "@tanstack/react-query";

export const QUIZ_QUERY_KEYS = {
  all: ["quizzes"] as const,
  lists: () => [...QUIZ_QUERY_KEYS.all, "list"] as const,
  list: (filters: any) => [...QUIZ_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...QUIZ_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUIZ_QUERY_KEYS.details(), id] as const,
  stats: (id: number) => [...QUIZ_QUERY_KEYS.detail(id), "stats"] as const,
};

interface UseQuizOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

export function useQuiz(id: number | null, options: UseQuizOptions = {}) {
  const {
    enabled = !!id,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  return useQuery<QuizResponse, Error>({
    queryKey: id ? QUIZ_QUERY_KEYS.detail(id) : ["quiz", "empty"],
    queryFn: () => {
      if (!id) {
        throw new Error("Quiz ID is required");
      }
      return quizCRUDAPI.getQuizById(id);
    },
    enabled,
    refetchOnWindowFocus,
    staleTime,
  });
}

export function useQuizzes(filters: any = {}) {
  return useQuery({
    queryKey: QUIZ_QUERY_KEYS.list(filters),
    queryFn: () => quizCRUDAPI.getQuizzes(filters),
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useQuizStats(id: number | null) {
  return useQuery({
    queryKey: id ? QUIZ_QUERY_KEYS.stats(id) : ["quiz", "stats", "empty"],
    queryFn: () => {
      if (!id) {
        throw new Error("Quiz ID is required for stats");
      }
      return quizCRUDAPI.getQuizStats(id);
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
  });
}
