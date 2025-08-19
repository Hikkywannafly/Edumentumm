import type {
  CreateQuizRequest,
  QuizResponse,
  UpdateQuizRequest,
} from "@/types/quiz";
import { BaseQuizAPI } from "../base";

export interface QuizFilters {
  page?: number;
  limit?: number;
  category_id?: number;
  user_id?: number;
  search?: string;
  difficulty?: string;
  question_type?: string;
  visibility?: string;
  sort_by?: "created_at" | "updated_at" | "title";
  sort_order?: "asc" | "desc";
}

export interface QuizListResponse {
  quizzes: QuizResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export class QuizCRUDAPI extends BaseQuizAPI {
  /**
   * Create a new quiz
   */
  async createQuiz(quizRequest: CreateQuizRequest): Promise<QuizResponse> {
    const response = await this.request<QuizResponse>("/student/quiz", {
      method: "POST",
      body: JSON.stringify(quizRequest),
    });
    return response;
  }

  /**
   * Get quiz by ID
   */
  async getQuizById(id: number): Promise<QuizResponse> {
    const response = await this.request<QuizResponse>(`/student/quiz/${id}`);
    return response;
  }

  // /**
  //  * Get list of quizzes with optional filters
  //  */
  // async getQuizzes(filters: QuizFilters = {}): Promise<QuizListResponse> {
  //   const searchParams = new URLSearchParams();

  //   // Add pagination
  //   if (filters.page) searchParams.append('page', filters.page.toString());
  //   if (filters.limit) searchParams.append('limit', filters.limit.toString());

  //   // Add filters
  //   if (filters.category_id) searchParams.append('category_id', filters.category_id.toString());
  //   if (filters.user_id) searchParams.append('user_id', filters.user_id.toString());
  //   if (filters.search) searchParams.append('search', filters.search);
  //   if (filters.difficulty) searchParams.append('difficulty', filters.difficulty);
  //   if (filters.question_type) searchParams.append('question_type', filters.question_type);
  //   if (filters.visibility) searchParams.append('visibility', filters.visibility);

  //   // Add sorting
  //   if (filters.sort_by) searchParams.append('sort_by', filters.sort_by);
  //   if (filters.sort_order) searchParams.append('sort_order', filters.sort_order);

  //   const query = searchParams.toString();
  //   const endpoint = query ? `/student/quiz?${query}` : '/student/quiz';

  //   const response = await this.request<QuizListResponse>(endpoint);
  //   return response;
  // }

  /**
   * Update an existing quiz
   */
  async updateQuiz(updateRequest: UpdateQuizRequest): Promise<QuizResponse> {
    const { id, ...updateData } = updateRequest;

    const response = await this.request<QuizResponse>(`/student/quiz/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
    return response;
  }

  /**
   * Delete a quiz
   */
  async deleteQuiz(id: number): Promise<void> {
    await this.request<void>(`/student/quiz/${id}`, {
      method: "DELETE",
    });
  }

  //   /**
  //    * Get quizzes by category
  //    */
  //   async getQuizzesByCategory(categoryId: number, filters: Omit<QuizFilters, 'category_id') = { }): Promise < QuizListResponse > {
  //     return this.getQuizzes({ ...filters, category_id: categoryId });
  //   }

  //   /**
  //    * Get user's quizzes
  //    */
  //   async getUserQuizzes(userId: number, filters: Omit < QuizFilters, 'user_id') = {}): Promise < QuizListResponse > {
  //   return this.getQuizzes({ ...filters, user_id: userId });
  // }

  //   /**
  //    * Search quizzes
  //    */
  //   async searchQuizzes(searchTerm: string, filters: Omit < QuizFilters, 'search') = {}): Promise < QuizListResponse > {
  //   return this.getQuizzes({ ...filters, search: searchTerm });
  // }

  //   /**
  //    * Duplicate a quiz
  //    */
  //   async duplicateQuiz(id: number, newTitle ?: string): Promise < QuizResponse > {
  //   const originalQuiz = await this.getQuizById(id);

  //   const duplicateRequest: CreateQuizRequest = {
  //     title: newTitle || `${originalQuiz.title} (Copy)`,
  //     description: originalQuiz.description,
  //     category_id: originalQuiz.category_id,
  //     quiz_data: {
  //       ...originalQuiz.quiz_data,
  //       // Reset some metadata
  //       metadata: {
  //         ...originalQuiz.quiz_data.metadata,
  //         // Keep the structure but reset dates/IDs will be handled by server
  //       }
  //     }
  //   };

  //   return this.createQuiz(duplicateRequest);
  // }

  //   /**
  //    * Update quiz visibility
  //    */
  //   async updateQuizVisibility(id: number, visibility: 'PRIVATE' | 'PUBLIC' | 'UNLISTED'): Promise < QuizResponse > {
  //   const quiz = await this.getQuizById(id);

  //   const updateRequest: UpdateQuizRequest = {
  //     id,
  //     quiz_data: {
  //       ...quiz.quiz_data,
  //       settings: {
  //         ...quiz.quiz_data.settings,
  //         visibility
  //       }
  //     }
  //   };

  //   return this.updateQuiz(updateRequest);
  // }

  //   /**
  //    * Publish quiz (change visibility to public)
  //    */
  //   async publishQuiz(id: number): Promise < QuizResponse > {
  //   return this.updateQuizVisibility(id, 'PUBLIC');
  // }

  //   /**
  //    * Unpublish quiz (change visibility to private)
  //    */
  //   async unpublishQuiz(id: number): Promise < QuizResponse > {
  //   return this.updateQuizVisibility(id, 'PRIVATE');
  // }

  //   /**
  //    * Archive quiz (change visibility to unlisted)
  //    */
  //   async archiveQuiz(id: number): Promise < QuizResponse > {
  //   return this.updateQuizVisibility(id, 'UNLISTED');
  // }

  //   /**
  //    * Get quiz statistics (if needed)
  //    */
  //   async getQuizStats(id: number): Promise < {
  //   total_attempts: number;
  //   average_score: number;
  //   completion_rate: number;
  // } > {
  //   const response = await this.request<{
  //     total_attempts: number;
  //     average_score: number;
  //     completion_rate: number;
  //   }>(`/student/quiz/${id}/stats`);
  //   return response;
  // }
}

export const quizCRUDAPI = new QuizCRUDAPI();
