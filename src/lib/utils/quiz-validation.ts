import type { QuestionData } from "@/types/quiz";

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Validate quiz content before processing
export function validateQuizContent(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push("Content cannot be empty");
  }

  if (content.length < 50) {
    warnings.push("Content is very short, may not generate quality questions");
  }

  if (content.length > 50000) {
    warnings.push("Content is very long, processing may take time");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate generated questions
export function validateQuestions(questions: QuestionData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!questions || questions.length === 0) {
    errors.push("No questions provided");
    return { isValid: false, errors, warnings };
  }

  questions.forEach((question, index) => {
    const questionNum = index + 1;

    // Validate question text
    if (!question.question || question.question.trim().length === 0) {
      errors.push(`Question ${questionNum}: Question text is required`);
    }

    // Validate answers for non-free-response questions
    if (question.type !== "FREE_RESPONSE") {
      if (!question.answers || question.answers.length === 0) {
        errors.push(`Question ${questionNum}: Answers are required`);
      } else {
        const correctAnswers = question.answers.filter((a) => a.isCorrect);

        if (correctAnswers.length === 0) {
          errors.push(
            `Question ${questionNum}: At least one correct answer is required`,
          );
        }

        if (question.type === "TRUE_FALSE" && question.answers.length !== 2) {
          warnings.push(
            `Question ${questionNum}: True/False questions should have exactly 2 answers`,
          );
        }

        if (
          question.type === "MULTIPLE_CHOICE" &&
          question.answers.length < 2
        ) {
          errors.push(
            `Question ${questionNum}: Multiple choice questions need at least 2 answers`,
          );
        }
      }
    }

    // Validate points
    if (question.points && question.points < 1) {
      warnings.push(`Question ${questionNum}: Points should be at least 1`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate API key
export function validateAPIKey(apiKey?: string): ValidationResult {
  const errors: string[] = [];

  if (!apiKey || apiKey.trim().length === 0) {
    errors.push("API key is required for AI operations");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
  };
}

// Sanitize and clean question data
export function sanitizeQuestions(questions: QuestionData[]): QuestionData[] {
  return questions.map((question) => ({
    ...question,
    question: question.question?.trim() || "",
    explanation: question.explanation?.trim() || "",
    tags: question.tags?.filter((tag) => tag.trim().length > 0) || [],
    answers:
      question.answers?.map((answer) => ({
        ...answer,
        text: answer.text?.trim() || "",
        explanation: answer.explanation?.trim() || "",
      })) || [],
  }));
}

// Check if questions meet minimum quality standards
export function checkQuestionQuality(
  questions: QuestionData[],
): ValidationResult {
  const warnings: string[] = [];

  questions.forEach((question, index) => {
    const questionNum = index + 1;

    // Check question length
    if (question.question.length < 10) {
      warnings.push(`Question ${questionNum}: Question text is very short`);
    }

    // Check answer diversity for multiple choice
    if (question.type === "MULTIPLE_CHOICE" && question.answers) {
      const answerLengths = question.answers.map((a) => a.text.length);
      const avgLength =
        answerLengths.reduce((sum, len) => sum + len, 0) / answerLengths.length;

      if (avgLength < 5) {
        warnings.push(`Question ${questionNum}: Answer options are very short`);
      }
    }

    // Check for explanation
    if (!question.explanation || question.explanation.length === 0) {
      warnings.push(`Question ${questionNum}: Missing explanation`);
    }
  });

  return {
    isValid: true,
    errors: [],
    warnings,
  };
}
