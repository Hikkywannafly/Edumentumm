import type { CreateQuizRequest, QuizResponse } from "@/types/quiz";
import { BaseQuizAPI } from "./base";

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

  // TODO: Add other CRUD methods later
  // async getQuizzes()
  // async getQuizById()
  // async updateQuiz()
  // async deleteQuiz()
}

export const quizCRUDAPI = new QuizCRUDAPI();
