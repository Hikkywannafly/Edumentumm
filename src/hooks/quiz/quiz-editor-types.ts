import type {
  BackendQuizEntity,
  GeneratedQuiz,
  QuestionData,
} from "@/types/quiz";

export interface UpdateQuizData {
  title?: string;
  description?: string;
  questions?: QuestionData[];
  metadata?: any;
}

export interface UseQuizLoaderReturn {
  originalQuiz: BackendQuizEntity | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
}

export interface UseQuizStateManagerReturn {
  quiz: GeneratedQuiz | null;
  updateQuiz: (updates: UpdateQuizData) => Promise<void>;
  hasUnsavedChanges: boolean;
  isValid: boolean;
  reset: () => void;
}

export interface UseQuizSaverReturn {
  saveQuiz: () => Promise<void>;
  isSaving: boolean;
  error: Error | null;
}

export interface UseQuestionManagerReturn {
  addQuestion: (question: QuestionData) => void;
  updateQuestion: (questionId: string, updates: Partial<QuestionData>) => void;
  deleteQuestion: (questionId: string) => void;
  moveQuestion: (fromIndex: number, toIndex: number) => void;
}

export interface UseQuizEditorReturn
  extends UseQuizLoaderReturn,
    UseQuizStateManagerReturn,
    UseQuizSaverReturn,
    UseQuestionManagerReturn {
  // Combined interface for the main hook
}

export interface QuizConverterUtils {
  convertBackendToFrontend: (quiz: any) => GeneratedQuiz;
}

export type { BackendQuizEntity, GeneratedQuiz, QuestionData };
