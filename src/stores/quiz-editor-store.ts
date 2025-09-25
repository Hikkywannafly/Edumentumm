import type {
  BackendQuizEntity,
  GeneratedQuiz,
  QuestionData,
} from "@/types/quiz";

// File upload interface
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file: File;
  status: "uploading" | "processing" | "success" | "error";
  progress: number;
  parsedContent?: string;
  actualFile?: File;
  error?: string;
}

// Export GeneratedQuiz for external use
export type { GeneratedQuiz };
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface QuizEditorState {
  quizData: GeneratedQuiz | null;
  savedQuiz: BackendQuizEntity | null;

  isEditing: boolean;
  isLoading: boolean;
  isAutoSaving: boolean;

  setQuizData: (quiz: GeneratedQuiz | null) => void;
  updateQuizData: (updates: Partial<GeneratedQuiz>) => void;
  setSavedQuiz: (quiz: BackendQuizEntity | null) => void;
  addQuestion: (question: QuestionData) => void;
  addQuestionAfter: (afterIndex: number, question: QuestionData) => void;
  updateQuestion: (questionId: string, updates: Partial<QuestionData>) => void;
  deleteQuestion: (questionId: string) => void;
  moveQuestion: (fromIndex: number, toIndex: number) => void;
  setEditing: (editing: boolean) => void;
  setLoading: (loading: boolean) => void;
  setAutoSaving: (saving: boolean) => void;
  reset: () => void;
  forceReset: () => void; // Force clear localStorage and reset state
}

export const useQuizEditorStore = create<QuizEditorState>()(
  persist(
    (set) => ({
      quizData: null,
      savedQuiz: null,
      isEditing: false,
      isLoading: false,
      isAutoSaving: false,

      // Actions
      setQuizData: (quiz: GeneratedQuiz | null) => set({ quizData: quiz }),

      updateQuizData: (updates) =>
        set((state) => ({
          quizData: state.quizData ? { ...state.quizData, ...updates } : null,
        })),

      setSavedQuiz: (quiz) => set({ savedQuiz: quiz }),

      addQuestion: (question) =>
        set((state) => ({
          quizData: state.quizData
            ? {
                ...state.quizData,
                questions: [...state.quizData.questions, question],
              }
            : null,
        })),

      addQuestionAfter: (afterIndex, question) =>
        set((state) => {
          if (!state.quizData) return state;

          const questions = [...state.quizData.questions];
          questions.splice(afterIndex + 1, 0, question);

          return {
            quizData: {
              ...state.quizData,
              questions,
            },
          };
        }),

      updateQuestion: (questionId, updates) =>
        set((state) => ({
          quizData: state.quizData
            ? {
                ...state.quizData,
                questions: state.quizData.questions.map((q) =>
                  q.id === questionId ? { ...q, ...updates } : q,
                ),
              }
            : null,
        })),

      deleteQuestion: (questionId) =>
        set((state) => ({
          quizData: state.quizData
            ? {
                ...state.quizData,
                questions: state.quizData.questions.filter(
                  (q) => q.id !== questionId,
                ),
              }
            : null,
        })),

      moveQuestion: (fromIndex, toIndex) =>
        set((state) => {
          if (!state.quizData) return state;

          const questions = [...state.quizData.questions];
          const [movedQuestion] = questions.splice(fromIndex, 1);
          questions.splice(toIndex, 0, movedQuestion);

          return {
            quizData: {
              ...state.quizData,
              questions,
            },
          };
        }),

      setEditing: (editing) => set({ isEditing: editing }),
      setLoading: (loading) => set({ isLoading: loading }),
      setAutoSaving: (saving) => set({ isAutoSaving: saving }),

      reset: () =>
        set({
          quizData: null,
          savedQuiz: null,
          isEditing: false,
          isLoading: false,
          isAutoSaving: false,
        }),

      forceReset: () => {
        // Clear localStorage immediately
        if (typeof window !== "undefined") {
          localStorage.removeItem("quiz-editor-storage");
        }
        // Reset state
        set({
          quizData: null,
          savedQuiz: null,
          isEditing: false,
          isLoading: false,
          isAutoSaving: false,
        });
      },
    }),
    {
      name: "quiz-editor-storage",
      // Only persist quizData and savedQuiz, not UI state
      partialize: (state) => ({
        quizData: state.quizData,
        savedQuiz: state.savedQuiz,
      }),
    },
  ),
);
