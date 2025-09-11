"use client";

import { toast } from "@/hooks/use-toast";
import type { BackendQuizEntity } from "@/types/quiz";
import type { QuizDisplayData } from "@/types/quiz-display";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys following the project specification
export const QUIZ_QUERY_KEYS = {
  all: ["quizzes"] as const,
  lists: () => [...QUIZ_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...QUIZ_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...QUIZ_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUIZ_QUERY_KEYS.details(), id] as const,
  stats: () => [...QUIZ_QUERY_KEYS.all, "stats"] as const,
  editing: (id: string) => ["quiz-editing", id] as const,
} as const;

interface QuizListParams {
  page?: number;
  size?: number;
  search?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  visibility?: "PUBLIC" | "PRIVATE" | "UNLISTED" | "PREMIUM";
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

interface QuizListResponse {
  content: QuizDisplayData[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

interface ApiResponse {
  success: boolean;
  data: QuizListResponse;
}

interface QuizStatsData {
  totalQuizzes: number;
  publishedQuizzes: number;
  draftQuizzes: number;
  totalAttempts: number;
}

// Convert backend quiz entity to display format
function convertToDisplayData(backendQuiz: any): QuizDisplayData {
  // Extract tags - handle both string arrays and tag objects
  const tags: (string | any)[] = backendQuiz.tags
    ? backendQuiz.tags.map((tag: any) => {
        if (typeof tag === "string") {
          return tag;
        }

        return {
          id: tag.id,
          name: tag.name || tag,
          slug: tag.slug,
          icon: tag.icon,
          color: tag.color,
          description: tag.description,
        };
      })
    : [];

  const keywords: string[] = backendQuiz.keywords
    ? Array.isArray(backendQuiz.keywords)
      ? backendQuiz.keywords
      : []
    : [];

  return {
    id: backendQuiz.id,
    title: backendQuiz.title,
    description: backendQuiz.description || "",
    slug: backendQuiz.slug,
    difficulty: backendQuiz.difficulty,
    totalQuestions: backendQuiz.totalQuestions || 0,
    estimatedTime: backendQuiz.estimatedTime || 0,
    status: backendQuiz.status || "DRAFT",
    visibility: (backendQuiz.visibility as "PUBLIC" | "PRIVATE") || "PRIVATE",
    tags,
    keywords,
    createdAt: backendQuiz.createdAt,
    viewCount: backendQuiz.viewCount || 0,
    attemptCount: backendQuiz.totalAttempts || backendQuiz.attemptCount || 0,
    bestCorrectAnswers: backendQuiz.bestCorrectAnswers || undefined,
    // Additional fields from backend
    maxAttempts: backendQuiz.maxAttempts,
    publishedAt: backendQuiz.publishedAt,
    lastAttemptAt: backendQuiz.lastAttemptAt,
  };
}

// Main hook for fetching quiz list with pagination, filtering, and sorting
export function useQuizList(params: QuizListParams = {}) {
  const {
    page = 0,
    size = 10,
    search,
    difficulty,
    status,
    visibility,
    sortBy = "createdAt",
    sortDirection = "desc",
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDirection,
    ...(search && { search }),
    ...(difficulty && { difficulty }),
    ...(status && { status }),
    ...(visibility && { visibility }),
  });

  return useQuery<QuizListResponse, Error>({
    queryKey: QUIZ_QUERY_KEYS.list({
      page,
      size,
      search,
      difficulty,
      status,
      visibility,
      sortBy,
      sortDirection,
    }),
    queryFn: async (): Promise<QuizListResponse> => {
      const accessToken = localStorage.getItem("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/quiz?${queryParams}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quiz list: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      if (!result.success) {
        throw new Error(result.data?.toString() || "Failed to fetch quiz list");
      }
      const convertedContent = result.data.content.map((quiz: any) => {
        if ("slug" in quiz && "viewCount" in quiz) {
          return quiz as QuizDisplayData;
        }
        return convertToDisplayData(quiz as BackendQuizEntity);
      });

      return {
        ...result.data,
        content: convertedContent,
      };
    },
    refetchOnWindowFocus: false,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook for fetching quiz statistics
export function useQuizStats() {
  return useQuery<QuizStatsData, Error>({
    queryKey: QUIZ_QUERY_KEYS.stats(),
    queryFn: async (): Promise<QuizStatsData> => {
      const accessToken = localStorage.getItem("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      // Fetch basic stats by getting all quizzes without pagination
      const response = await fetch("/api/quiz?size=1000", {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quiz stats: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.success) {
        throw new Error("Failed to fetch quiz stats");
      }

      const quizzes = result.data.content.map((quiz: any) => {
        if ("slug" in quiz && "viewCount" in quiz) {
          return quiz as QuizDisplayData;
        }
        return convertToDisplayData(quiz as BackendQuizEntity);
      });

      return {
        totalQuizzes: quizzes.length,
        publishedQuizzes: quizzes.filter((q) => q.status === "PUBLISHED")
          .length,
        draftQuizzes: quizzes.filter((q) => q.status === "DRAFT").length,
        totalAttempts: quizzes.reduce(
          (sum, q) => sum + (q.attemptCount || 0),
          0,
        ),
      };
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for deleting a quiz with optimistic updates
export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (quizId: number): Promise<void> => {
      const accessToken = localStorage.getItem("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/quiz/${quizId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete quiz");
      }
    },
    onSuccess: (_, quizId) => {
      // Show success message
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });

      // Invalidate and refetch quiz list queries
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.lists(),
      });

      // Invalidate quiz stats
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.stats(),
      });

      // Remove the specific quiz from cache
      queryClient.removeQueries({
        queryKey: QUIZ_QUERY_KEYS.detail(quizId),
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete quiz",
        variant: "destructive",
      });
    },
  });
}

// Export types for external use
export type { QuizListParams, QuizListResponse, QuizStatsData };
