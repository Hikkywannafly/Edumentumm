import type {
  BackendQuizEntity,
  GeneratedQuiz,
  QuestionData,
  QuizSettings,
} from "./quiz";

// Unified payload for quiz creation/update operations
export interface QuizCreationPayload {
  // Core quiz data
  quiz: GeneratedQuiz;

  // User context
  userId: number;

  // Generation settings
  settings: QuizSettings;

  // Source information
  sourceType: "FILE" | "TEXT" | "AI_GENERATED";
  sourceContent?: string;

  // Auto-save options
  autoSave?: boolean;

  // Navigation options (handled by components, not hooks)
  redirectAfterSave?: boolean;
  redirectPath?: string;
}

// Simplified response type
export interface QuizCreationResult {
  success: boolean;
  quiz?: BackendQuizEntity;
  error?: string;
}

// Hook options for better control
export interface QuizCreationOptions {
  onSuccess?: (quiz: BackendQuizEntity) => void;
  onError?: (error: Error) => void;
  enableAutoSave?: boolean;
  enableRedirect?: boolean;
}

// File processing result
export interface FileProcessingResult {
  questions: QuestionData[];
  metadata: {
    sourceFiles: string[];
    totalQuestions: number;
    extractionMethod: "DIRECT" | "AI_EXTRACT" | "AI_GENERATE";
  };
}
