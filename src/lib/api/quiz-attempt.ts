import { apiClient } from "@/lib/api/client";

// Request payload for submitting a quiz attempt
export interface SubmitAttemptRequest {
  answers: Array<{
    questionId: string;
    selectedOptionIds: string[];
    timeSpent: string; // Changed from number to string to fix backend casting error
  }>;
  totalTimeSpent?: number; // Add optional total time field as a workaround
}

// Response structure for attempt review
export interface AttemptReviewDto {
  attemptId: number;
  quizId: number;
  score: number;
  maxScore: number;
  finalScorePercent: number;
  correct: number;
  wrong: number;
  skipped: number;
  timeSpentSec: number;
  performance: string;
  completedAt: string;
  questions: Array<{
    questionId: string;
    order: number;
    questionText: string;
    isCorrect: boolean;
    correct?: boolean;
    selectedOptionIds: string[];
    correctOptionIds: string[];
    pointsPossible: number;
    pointsEarned: number;
    timeSpent: string; // Add timeSpent field for per-question time tracking
    explanation: string;
    options: Array<{
      id: string;
      text: string;
      isCorrect?: boolean;
    }>;
  }>;
}

// Response structure for attempt list
export interface AttemptListItemDto {
  attemptId: number;
  quizId: number;
  score: number;
  maxScore: number;
  finalScorePercent: number;
  correct: number;
  wrong: number;
  skipped: number;
  timeSpentSec: number;
  performance: string;
  completedAt: string;
}

class QuizAttemptAPI {
  async submitAttempt(
    quizId: number,
    data: SubmitAttemptRequest,
  ): Promise<AttemptReviewDto> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: AttemptReviewDto;
      }>(`/user/quizzes/${quizId}/attempts/submit`, data);

      console.log("Quiz attempt submission response:", response);
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to submit quiz attempt:", error);

      if (error.response) {
        console.error(
          `Quiz attempt submission failed with status ${error.response.status}:`,
          error.response.data,
        );
        throw new Error(
          `Failed to submit quiz attempt: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`,
        );
      }

      if (error.request) {
        console.error("No response received:", error.request);
        throw new Error(
          "Failed to submit quiz attempt: No response from server",
        );
      }

      console.error("Error setting up request:", error.message);
      throw new Error(`Failed to submit quiz attempt: ${error.message}`);
    }
  }

  async getAttemptReview(attemptId: number): Promise<AttemptReviewDto> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: AttemptReviewDto;
      }>(`/user/attempts/${attemptId}/review`);

      return response.data.data;
    } catch (error: any) {
      console.error("Failed to get attempt review:", error);

      if (error.response) {
        console.error(
          `Attempt review fetch failed with status ${error.response.status}:`,
          error.response.data,
        );
        throw new Error(
          `Failed to get attempt review: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`,
        );
      }

      if (error.request) {
        console.error("No response received:", error.request);
        throw new Error(
          "Failed to get attempt review: No response from server",
        );
      }

      console.error("Error setting up request:", error.message);
      throw new Error(`Failed to get attempt review: ${error.message}`);
    }
  }

  async getLatestAttempt(quizId: number): Promise<AttemptReviewDto> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: AttemptReviewDto;
      }>(`/user/quizzes/${quizId}/attempts/latest`);
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to get latest attempt:", error);

      if (error.response) {
        console.error(
          `Latest attempt fetch failed with status ${error.response.status}:`,
          error.response.data,
        );
        throw new Error(
          `Failed to get latest attempt: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`,
        );
      }

      if (error.request) {
        console.error("No response received:", error.request);
        throw new Error(
          "Failed to get latest attempt: No response from server",
        );
      }

      console.error("Error setting up request:", error.message);
      throw new Error(`Failed to get latest attempt: ${error.message}`);
    }
  }

  async getQuizAttempts(quizId: number): Promise<AttemptListItemDto[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: AttemptListItemDto[];
      }>(`/user/quizzes/${quizId}/attempts`);
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to get quiz attempts:", error);

      if (error.response) {
        console.error(
          `Quiz attempts fetch failed with status ${error.response.status}:`,
          error.response.data,
        );
        throw new Error(
          `Failed to get quiz attempts: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`,
        );
      }

      if (error.request) {
        console.error("No response received:", error.request);
        throw new Error("Failed to get quiz attempts: No response from server");
      }

      console.error("Error setting up request:", error.message);
      throw new Error(`Failed to get quiz attempts: ${error.message}`);
    }
  }
}

// Export singleton instance
export const quizAttemptAPI = new QuizAttemptAPI();
