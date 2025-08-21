export interface QuizOperationResult {
  success: boolean;
  questions?: any[];
  quiz?: any;
  quizId?: number;
  error?: string;
}

export interface FlexibleQuizSettings {
  [key: string]: any;

  generationMode?: "GENERATE" | "EXTRACT";
  fileProcessingMode?: "PARSE_THEN_SEND" | "SEND_DIRECT";
  useAI?: boolean;
  autoSave?: boolean;
  includeCategories?: boolean;

  language?: any;
  parsing_mode?: any;
  parsingMode?: any;
  numberOfQuestions?: number;
  number_of_questions?: number;
}

export function normalizeSettings(settings: any): FlexibleQuizSettings {
  if (!settings) return {};

  return {
    ...settings,
    parsing_mode: settings.parsing_mode || settings.parsingMode,
    parsingMode: settings.parsingMode || settings.parsing_mode,
    numberOfQuestions:
      settings.numberOfQuestions || settings.number_of_questions,
    number_of_questions:
      settings.number_of_questions || settings.numberOfQuestions,
  };
}
