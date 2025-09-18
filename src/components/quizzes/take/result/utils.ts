import type { BackendQuizEntity } from "@/types/quiz";

/**
 * Get the text representation of a selected option
 * @param questionId - The ID of the question
 * @param selectedOptionId - The ID of the selected option
 * @param questionType - The type of the question
 * @param quiz - The quiz entity
 * @returns The text representation of the selected option
 */
export const getSelectedOptionText = (
  questionId: string,
  selectedOptionId: string,
  questionType: string | undefined,
  quiz: BackendQuizEntity,
) => {
  // For text-based questions, return the actual text provided by the user
  if (questionType === "FILL_BLANK" || questionType === "FREE_RESPONSE") {
    return selectedOptionId || "No answer provided";
  }

  // Handle case where there's no selected option
  if (!selectedOptionId) {
    return "No answer selected";
  }

  // Find the question in the quiz
  const question = quiz.quizData?.questions?.find(
    (q: any) => q.id === questionId,
  );

  // For multiple choice questions, find the option text
  if (question?.options) {
    const option = question.options.find(
      (opt: any) => opt.id === selectedOptionId,
    );
    // If we found the option, return its text
    if (option) {
      return option.text;
    }
    // If we didn't find the option but have a selectedOptionId, return it directly
    // This handles cases where the ID might be the actual answer text
    return selectedOptionId;
  }

  // Fallback - return the ID itself if we can't find anything else
  return selectedOptionId || "No answer selected";
};

/**
 * Get the text representation of the correct option
 * @param questionId - The ID of the question
 * @param correctOptionId - The ID of the correct option
 * @param questionType - The type of the question
 * @param quiz - The quiz entity
 * @returns The text representation of the correct option
 */
export const getCorrectOptionText = (
  questionId: string,
  correctOptionId: string,
  questionType: string | undefined,
  quiz: BackendQuizEntity,
) => {
  // For text-based questions, return the correct answer text
  if (questionType === "FILL_BLANK" || questionType === "FREE_RESPONSE") {
    return correctOptionId || "No correct answer defined";
  }

  // Handle case where there's no correct option
  if (!correctOptionId) {
    return "No correct answer defined";
  }

  // Find the question in the quiz
  const question = quiz.quizData?.questions?.find(
    (q: any) => q.id === questionId,
  );

  // For multiple choice questions, find the option text
  if (question?.options) {
    const option = question.options.find(
      (opt: any) => opt.id === correctOptionId,
    );
    // If we found the option, return its text
    if (option) {
      return option.text;
    }
    // If we didn't find the option but have a correctOptionId, return it directly
    // This handles cases where the ID might be the actual answer text
    return correctOptionId;
  }

  return correctOptionId || "Unknown";
};
