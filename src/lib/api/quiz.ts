import { apiClient } from "@/lib/api/client";
import type { BackendQuizEntity } from "@/types/quiz";

interface QuizListResponse {
  content: BackendQuizEntity[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

interface QuizStatsData {
  totalQuizzes: number;
  publishedQuizzes: number;
  draftQuizzes: number;
  totalAttempts: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class QuizAPI {
  async getQuizList(params: Record<string, string>): Promise<QuizListResponse> {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await apiClient.get<ApiResponse<QuizListResponse>>(
        `/student/quizzes/page?${queryParams.toString()}`,
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch quiz list");
      }

      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch quiz list:", error);
      throw error;
    }
  }

  async getQuizStats(): Promise<QuizStatsData> {
    try {
      const response = await apiClient.get<ApiResponse<QuizStatsData>>(
        "/student/quizzes/stats",
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch quiz stats");
      }

      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch quiz stats:", error);
      throw error;
    }
  }
  async deleteQuiz(quizId: number): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `/student/quizzes/${quizId}`,
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete quiz");
      }
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      throw error;
    }
  }
}

export const quizAPI = new QuizAPI();
