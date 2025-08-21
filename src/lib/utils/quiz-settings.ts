import type { QuizSettings } from "@/types/quiz";

// Normalize settings field names to handle legacy vs new conventions
export function normalizeQuizSettings(settings: any): any {
  if (!settings) return {};

  return {
    ...settings,
    // Normalize field names
    parsing_mode: settings.parsing_mode || settings.parsingMode,
    parsingMode: settings.parsingMode || settings.parsing_mode,
    numberOfQuestions:
      settings.numberOfQuestions || settings.number_of_questions,
    number_of_questions:
      settings.number_of_questions || settings.numberOfQuestions,
    questionType: settings.questionType || settings.question_type,
    question_type: settings.question_type || settings.questionType,
  };
}

export const DEFAULT_QUIZ_SETTINGS = {
  EXTRACT: {
    generationMode: "EXTRACT" as const,
    fileProcessingMode: "PARSE_THEN_SEND" as const,
    useAI: false,
    visibility: "PRIVATE" as const,
    language: "AUTO" as const,
    parsing_mode: "BALANCED" as const,
  },
  GENERATE: {
    generationMode: "GENERATE" as const,
    fileProcessingMode: "PARSE_THEN_SEND" as const,
    useAI: true,
    visibility: "PRIVATE" as const,
    language: "AUTO" as const,
    questionType: "MULTIPLE_CHOICE" as const,
    numberOfQuestions: 5,
    mode: "QUIZ" as const,
    difficulty: "EASY" as const,
    task: "GENERATE_QUIZ" as const,
    parsing_mode: "BALANCED" as const,
  },
} as const;

// Merge user settings with defaults
export function mergeWithDefaults(
  userSettings: Partial<QuizSettings>,
  mode: "EXTRACT" | "GENERATE" = "GENERATE",
): any {
  const defaults = DEFAULT_QUIZ_SETTINGS[mode];
  const normalized = normalizeQuizSettings(userSettings);

  return {
    ...defaults,
    ...normalized,
    // Ensure useAI is set correctly based on mode
    useAI: mode === "GENERATE" ? true : (normalized.useAI ?? defaults.useAI),
  };
}

// Validate settings for specific operations
export function validateSettings(
  settings: any,
  operation: "extract" | "generate",
): string[] {
  const errors: string[] = [];

  if (operation === "generate") {
    if (!settings.numberOfQuestions || settings.numberOfQuestions < 1) {
      errors.push("Number of questions must be at least 1");
    }
    if (settings.numberOfQuestions > 20) {
      errors.push("Number of questions cannot exceed 20");
    }
  }

  if (
    settings.language &&
    !["AUTO", "EN", "VI", "KO", "ZH", "JA"].includes(settings.language)
  ) {
    errors.push("Invalid language setting");
  }

  return errors;
}

// Extract settings for specific service layers
export function extractSettingsForAI(settings: any): any {
  const normalized = normalizeQuizSettings(settings);

  return {
    numberOfQuestions:
      normalized.numberOfQuestions || normalized.number_of_questions || 5,
    questionType: normalized.questionType || normalized.question_type,
    difficulty: normalized.difficulty,
    language: normalized.language,
    parsingMode: normalized.parsingMode || normalized.parsing_mode,
    includeCategories: normalized.includeCategories !== false,
    useMultiAgent:
      normalized.parsing_mode === "THOROUGH" ||
      normalized.parsingMode === "THOROUGH",
  };
}

export function extractSettingsForExtraction(settings: any): any {
  const normalized = normalizeQuizSettings(settings);

  return {
    language: normalized.language,
    parsing_mode: normalized.parsing_mode || normalized.parsingMode,
  };
}
