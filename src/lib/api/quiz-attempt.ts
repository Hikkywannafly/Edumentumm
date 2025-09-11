import { apiClient } from "@/lib/api/client";

// Request payload for submitting a quiz attempt
export interface SubmitAttemptRequest {
  answers: Array<{
    questionId: string;
    selectedOptionIds: string[];
    timeSpent: number;
  }>;
  startedAt?: string;
  completedAt?: string;
  timeSpentSec?: number;
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
    selectedOptionIds: string[];
    correctOptionIds: string[];
    pointsPossible: number;
    pointsEarned: number;
    explanation: string;
    options: Array<{
      id: string;
      text: string;
    }>;
  }>;
}

class QuizAttemptAPI {
  async submitAttempt(
    quizId: number,
    data: SubmitAttemptRequest,
  ): Promise<AttemptReviewDto> {
    try {
      const response = await apiClient.post<AttemptReviewDto>(
        `/user/quizzes/${quizId}/attempts/submit`,
        data,
      );

      return response.data;
    } catch (error) {
      console.error("Failed to submit quiz attempt:", error);
      throw error;
    }
  }

  async getAttemptReview(attemptId: number): Promise<AttemptReviewDto> {
    try {
      const response = await apiClient.get<AttemptReviewDto>(
        `/user/attempts/${attemptId}/review`,
      );

      return response.data;
    } catch (error) {
      console.error("Failed to get attempt review:", error);
      throw error;
    }
  }

  async getLatestAttempt(quizId: number): Promise<AttemptReviewDto> {
    try {
      const response = await apiClient.get<AttemptReviewDto>(
        `/user/quizzes/${quizId}/attempts/latest`,
      );

      return response.data;
    } catch (error) {
      console.error("Failed to get latest attempt:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const quizAttemptAPI = new QuizAttemptAPI();
