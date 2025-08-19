// Re-export types for convenience
export type {
  CreateQuizRequest,
  UpdateQuizRequest,
  QuizResponse,
  QuizEntity,
} from "@/types/quiz";

// Export API classes
export { BaseQuizAPI } from "./base";
export { QuizCRUDAPI, quizCRUDAPI } from "./crud";

// Helper functions
/**
 * Helper function to calculate total points from quiz data
 */
export function calculateTotalPoints(questions: any[]): number {
  return questions.reduce(
    (total, question) => total + (question.points || 1),
    0,
  );
}

/**
 * Helper function to calculate estimated time
 */
export function calculateEstimatedTime(questions: any[]): number {
  // Estimate 30 seconds per question on average
  return Math.ceil(questions.length * 0.5);
}

/**
 * Helper function to validate quiz data
 */
export function validateQuizData(quizData: any): boolean {
  if (!quizData.questions || !Array.isArray(quizData.questions)) {
    return false;
  }

  if (quizData.questions.length === 0) {
    return false;
  }

  return quizData.questions.every(
    (question: any) =>
      question.question &&
      question.type &&
      question.answers &&
      Array.isArray(question.answers) &&
      question.id,
  );
}
