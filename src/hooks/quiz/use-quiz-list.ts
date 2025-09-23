"use client";

import { toast } from "@/hooks/use-toast";
import type { BackendQuizEntity } from "@/types/quiz";
import type { QuizDisplayData } from "@/types/quiz-display";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

function convertToDisplayData(backendQuiz: any): QuizDisplayData {
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

  // Ensure we're properly handling all the numeric fields
  const attemptCount =
    backendQuiz.totalAttempts || backendQuiz.attemptCount || 0;

  const bestCorrectAnswers =
    backendQuiz.bestCorrectAnswers !== undefined &&
    backendQuiz.bestCorrectAnswers !== null
      ? backendQuiz.bestCorrectAnswers
      : undefined;

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
    attemptCount: attemptCount,
    bestCorrectAnswers: bestCorrectAnswers,
    maxAttempts: backendQuiz.maxAttempts,
    publishedAt: backendQuiz.publishedAt,
    lastAttemptAt: backendQuiz.lastAttemptAt,
  };
}

// Fetch quiz list data from API
async function fetchQuizList(
  params: QuizListParams,
): Promise<QuizListResponse> {
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
}

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
    queryFn: () => fetchQuizList(params),
    refetchOnWindowFocus: false,
    staleTime: 1 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function usePrefetchQuizList() {
  const queryClient = useQueryClient();
  const prefetchQuizDetail = usePrefetchQuizDetail();
  const prefetchQuizEditor = usePrefetchQuizEditor();

  return async (
    params: QuizListParams = {},
    options?: {
      prefetchDetails?: boolean;
      prefetchEditor?: boolean;
    },
  ) => {
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

    try {
      await queryClient.prefetchQuery({
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
        queryFn: () => fetchQuizList(params),
        staleTime: 1 * 60 * 1000, // 1 minute
      });

      // If prefetch details or editor is requested, fetch the data to get quiz IDs
      if (options?.prefetchDetails || options?.prefetchEditor) {
        try {
          const data = await fetchQuizList(params);
          const quizzes = data.content;

          // Prefetch details for each quiz in the list
          if (options.prefetchDetails) {
            for (const quiz of quizzes) {
              prefetchQuizDetail(quiz.id);
            }
          }

          // Prefetch editor data for each quiz in the list
          if (options.prefetchEditor) {
            for (const quiz of quizzes) {
              prefetchQuizEditor(String(quiz.id));
            }
          }
        } catch (error) {
          console.warn("Failed to prefetch quiz details/editor data:", error);
        }
      }
    } catch (error) {
      console.warn("Failed to prefetch quiz list data:", error);
    }
  };
}

/**
 * Prefetch hook for quiz detail data (for take quiz page)
 */
export function usePrefetchQuizDetail() {
  const queryClient = useQueryClient();

  return async (id: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      await queryClient.prefetchQuery({
        queryKey: ["quiz", id],
        queryFn: async () => {
          const response = await fetch(`/api/quiz/${id}`, {
            headers,
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch quiz detail: ${response.status}`);
          }

          const result = await response.json();
          return result.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    } catch (error) {
      console.warn("Failed to prefetch quiz detail:", error);
    }
  };
}

export function usePrefetchQuizEditor() {
  const queryClient = useQueryClient();

  return async (id: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      await queryClient.prefetchQuery({
        queryKey: ["quiz", id],
        queryFn: async () => {
          const response = await fetch(`/api/quiz/${id}`, {
            headers,
          });

          if (!response.ok) {
            throw new Error(
              `Failed to fetch quiz editor data: ${response.status}`,
            );
          }

          const result = await response.json();

          let data: any;
          if (
            typeof result === "object" &&
            result !== null &&
            "success" in result
          ) {
            if (!result.success) {
              throw new Error(result.message || "Failed to load quiz");
            }
            data = result.data;
          } else {
            // Old structure, data is directly in result
            data = result;
          }

          if (!data || typeof data !== "object" || !data.id) {
            throw new Error("Invalid quiz data received from server");
          }
          if (!data.quizData) {
            data.quizData = { questions: [] };
          }

          // Ensure questions array exists
          if (!Array.isArray(data.quizData.questions)) {
            data.quizData.questions = [];
          }

          return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    } catch (error) {
      console.warn("Failed to prefetch quiz editor data:", error);
    }
  };
}

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
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });

      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.stats(),
      });

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
