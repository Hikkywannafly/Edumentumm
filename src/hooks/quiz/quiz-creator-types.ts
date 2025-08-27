import type {
  CreateQuizPayload,
  GeneratedQuiz,
  ParsingMode,
  UploadedFile,
} from "@/types/quiz";

import type { BackendTag, QuizPayload } from "@/types/quizPlayload";
export interface QuizCreatorSettings {
  generationMode: "GENERATE" | "EXTRACT";
  fileProcessingMode: "PARSE_THEN_SEND" | "SEND_DIRECT";
  visibility: string;
  language: string;
  questionType: string;
  numberOfQuestions: number;
  mode: string;
  difficulty: string;
  task: string;
  parsingMode: string;
}

export interface UseFileProcessorReturn {
  uploadedFiles: UploadedFile[];
  addFiles: (files: File[], parsingMode?: ParsingMode) => Promise<void>;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  isProcessingFiles: boolean;
  hasFiles: boolean;
  reset: () => void;
}

export interface UseQuizGeneratorReturn {
  generateQuiz: (settings: QuizCreatorSettings) => Promise<GeneratedQuiz>;
  extractQuiz: (settings: QuizCreatorSettings) => Promise<GeneratedQuiz>;
  isGenerating: boolean;
  currentQuiz: GeneratedQuiz | null;
  error: Error | null;
  reset: () => void;
}

export interface UseQuizSaverReturn {
  saveQuiz: (
    quiz: GeneratedQuiz,
    settings: QuizCreatorSettings,
  ) => Promise<{ id: number }>;
  isSaving: boolean;
  error: Error | null;
  reset: () => void;
}

export interface UseQuizCreatorReturn
  extends UseFileProcessorReturn,
    UseQuizGeneratorReturn,
    UseQuizSaverReturn {
  // Combined interface for the main hook
}

export type {
  CreateQuizPayload,
  GeneratedQuiz,
  UploadedFile,
  QuizPayload,
  BackendTag,
};
