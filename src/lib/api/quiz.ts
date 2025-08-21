import type { QuizResponse } from "@/types/quiz";

// Re-export new modular APIs
export { quizCRUDAPI } from "./quiz/";
// export {
//   calculateTotalPoints,
//   calculateEstimatedTime,
//   validateQuizData,
// } from "./quiz/index";

// Legacy compatibility - keep existing interfaces and types that other files might import
export interface QuizListParams {
  page?: number;
  limit?: number;
  category_id?: number;
  visibility?: "PRIVATE" | "PUBLIC" | "UNLISTED";
  search?: string;
  sort_by?: "created_at" | "updated_at" | "title";
  sort_order?: "ASC" | "DESC";
}

export interface QuizListResponse {
  quizzes: QuizResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuizStatsResponse {
  total_attempts: number;
  average_score: number;
  completion_rate: number;
  last_attempt?: string;
}

// Quiz Category interfaces
export interface QuizCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
}

// TODO: Migrate remaining QuizAPI class methods to new modular structure
// For now, keeping legacy exports for backward compatibility
