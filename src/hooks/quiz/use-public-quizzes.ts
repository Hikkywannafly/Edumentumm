"use client";

import { apiClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

export const PUBLIC_QUIZ_QUERY_KEYS = {
  all: ["public-quizzes"] as const,
  lists: () => [...PUBLIC_QUIZ_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...PUBLIC_QUIZ_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...PUBLIC_QUIZ_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...PUBLIC_QUIZ_QUERY_KEYS.details(), id] as const,
  tags: () => [...PUBLIC_QUIZ_QUERY_KEYS.all, "tags"] as const,
} as const;

interface PublicQuizListParams {
  page?: number;
  size?: number;
  search?: string;
  tagIds?: string; // Comma-separated tag IDs
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

interface QuizListResponse {
  content: QuizListResponseItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

interface QuizListResponseItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  maxAttempts: number;
  keywords: string[];
  createdAt: string;
  publishedAt: string;
  totalQuestions: number;
  lastAttemptAt: string;
  totalAttempts: number;
  bestCorrectAnswers: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  description: string;
}

// Fetch public quiz list data from API
async function fetchPublicQuizList(
  params: PublicQuizListParams,
): Promise<QuizListResponse> {
  try {
    const {
      page = 0,
      size = 10,
      search,
      tagIds,
      sortBy = "createdAt",
      sortDirection = "desc",
    } = params;

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      direction: sortDirection.toUpperCase(),
    });

    // Determine the correct endpoint based on parameters
    let endpoint = "/public/quizzes";

    if (search) {
      // For search, use the search endpoint and add the title parameter
      endpoint = "/public/quizzes/search";
      queryParams.set("title", search);
    } else if (tagIds) {
      endpoint = "/public/quizzes/by-tags";
      queryParams.set("tagIds", tagIds);
    }

    const response = await apiClient.get<ApiResponse<QuizListResponse>>(
      `${endpoint}?${queryParams.toString()}`,
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to fetch public quiz list",
      );
    }

    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch public quiz list:", error);
    throw error;
  }
}

// Fetch all tags for filtering
async function fetchAllTags(): Promise<Tag[]> {
  try {
    // Based on the Java controller, tags are fetched from /public/quizzes/tags
    const response = await apiClient.get<ApiResponse<Tag[]>>(
      "/public/quizzes/tags",
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch tags");
    }

    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    throw error;
  }
}

export function usePublicQuizList(params: PublicQuizListParams = {}) {
  const {
    page = 0,
    size = 10,
    search,
    tagIds,
    sortBy = "createdAt",
    sortDirection = "desc",
  } = params;

  return useQuery<QuizListResponse, Error>({
    queryKey: PUBLIC_QUIZ_QUERY_KEYS.list({
      page,
      size,
      search,
      tagIds,
      sortBy,
      sortDirection,
    }),
    queryFn: () => fetchPublicQuizList(params),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicQuizTags() {
  return useQuery<Tag[], Error>({
    queryKey: PUBLIC_QUIZ_QUERY_KEYS.tags(),
    queryFn: () => fetchAllTags(),
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
  });
}
