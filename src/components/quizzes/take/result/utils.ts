import type { BackendQuizEntity } from "@/types/quiz";

export const getSelectedOptionText = (
  questionId: string,
  selectedOptionId: string,
  questionType: string | undefined,
  quiz: BackendQuizEntity,
) => {
  const question = quiz.quizData?.questions?.find(
    (q: any) => q.id === questionId,
  );

  if (questionType === "FILL_BLANK" || questionType === "FREE_RESPONSE") {
    return selectedOptionId || "No answer provided";
  }

  const option = question?.options?.find(
    (opt: any) => opt.id === selectedOptionId,
  );
  return option ? option.text : "No answer selected";
};

export const getCorrectOptionText = (
  questionId: string,
  correctOptionId: string,
  questionType: string | undefined,
  quiz: BackendQuizEntity,
) => {
  const question = quiz.quizData?.questions?.find(
    (q: any) => q.id === questionId,
  );

  // For text-based questions, return the correct answer text
  if (questionType === "FILL_BLANK" || questionType === "FREE_RESPONSE") {
    return correctOptionId || "No correct answer defined";
  }

  // For multiple choice questions, find the option text
  const option = question?.options?.find(
    (opt: any) => opt.id === correctOptionId,
  );
  return option ? option.text : "Unknown";
};
