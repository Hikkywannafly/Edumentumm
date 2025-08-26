import type { GeneratedQuiz, QuestionData } from "@/types/quiz";
import { create } from "zustand";

/**
 * Simplified quiz editor store that only handles UI state and temporary editing
 * NO localStorage persistence - TanStack Query is the source of truth for data
 */
interface QuizEditorUIState {
  // Current quiz being edited (temporary state only)
  currentQuiz: GeneratedQuiz | null;

  // UI state
  isEditing: boolean;
  isLoading: boolean;
  currentView: "edit" | "preview" | "settings";
  sidebarOpen: boolean;

  // Temporary editing state
  hasUnsavedChanges: boolean;
  lastModified: string | null;

  // Actions
  setCurrentQuiz: (quiz: GeneratedQuiz | null) => void;
  updateCurrentQuiz: (updates: Partial<GeneratedQuiz>) => void;

  // Question actions (temporary editing only)
  addQuestion: (question: QuestionData) => void;
  updateQuestion: (questionId: string, updates: Partial<QuestionData>) => void;
  deleteQuestion: (questionId: string) => void;
  moveQuestion: (fromIndex: number, toIndex: number) => void;

  // UI actions
  setEditing: (editing: boolean) => void;
  setLoading: (loading: boolean) => void;
  setCurrentView: (view: "edit" | "preview" | "settings") => void;
  setSidebarOpen: (open: boolean) => void;

  // State management
  markAsModified: () => void;
  clearUnsavedChanges: () => void;
  reset: () => void;
}

export const useQuizEditorUIStore = create<QuizEditorUIState>((set, get) => ({
  // Initial state
  currentQuiz: null,
  isEditing: false,
  isLoading: false,
  currentView: "edit",
  sidebarOpen: true,
  hasUnsavedChanges: false,
  lastModified: null,

  // Quiz data actions (temporary editing only)
  setCurrentQuiz: (quiz) =>
    set({
      currentQuiz: quiz,
      hasUnsavedChanges: false,
      lastModified: quiz ? new Date().toISOString() : null,
    }),

  updateCurrentQuiz: (updates) => {
    const state = get();
    if (!state.currentQuiz) return;

    set({
      currentQuiz: { ...state.currentQuiz, ...updates },
      hasUnsavedChanges: true,
      lastModified: new Date().toISOString(),
    });
  },

  // Question actions (temporary editing)
  addQuestion: (question) => {
    const state = get();
    if (!state.currentQuiz) return;

    set({
      currentQuiz: {
        ...state.currentQuiz,
        questions: [...state.currentQuiz.questions, question],
      },
      hasUnsavedChanges: true,
      lastModified: new Date().toISOString(),
    });
  },

  updateQuestion: (questionId, updates) => {
    const state = get();
    if (!state.currentQuiz) return;

    set({
      currentQuiz: {
        ...state.currentQuiz,
        questions: state.currentQuiz.questions.map((q) =>
          q.id === questionId ? { ...q, ...updates } : q,
        ),
      },
      hasUnsavedChanges: true,
      lastModified: new Date().toISOString(),
    });
  },

  deleteQuestion: (questionId) => {
    const state = get();
    if (!state.currentQuiz) return;

    set({
      currentQuiz: {
        ...state.currentQuiz,
        questions: state.currentQuiz.questions.filter(
          (q) => q.id !== questionId,
        ),
      },
      hasUnsavedChanges: true,
      lastModified: new Date().toISOString(),
    });
  },

  moveQuestion: (fromIndex, toIndex) => {
    const state = get();
    if (!state.currentQuiz) return;

    const questions = [...state.currentQuiz.questions];
    const [movedQuestion] = questions.splice(fromIndex, 1);
    questions.splice(toIndex, 0, movedQuestion);

    set({
      currentQuiz: {
        ...state.currentQuiz,
        questions,
      },
      hasUnsavedChanges: true,
      lastModified: new Date().toISOString(),
    });
  },

  // UI actions
  setEditing: (editing) => set({ isEditing: editing }),
  setLoading: (loading) => set({ isLoading: loading }),
  setCurrentView: (view) => set({ currentView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // State management
  markAsModified: () =>
    set({
      hasUnsavedChanges: true,
      lastModified: new Date().toISOString(),
    }),

  clearUnsavedChanges: () =>
    set({
      hasUnsavedChanges: false,
      lastModified: new Date().toISOString(),
    }),

  reset: () =>
    set({
      currentQuiz: null,
      isEditing: false,
      isLoading: false,
      currentView: "edit",
      hasUnsavedChanges: false,
      lastModified: null,
    }),
}));

// Stable selector functions to avoid infinite loops
const selectCurrentQuiz = (state: QuizEditorUIState) => state.currentQuiz;

const selectUIState = (state: QuizEditorUIState) => ({
  isEditing: state.isEditing,
  isLoading: state.isLoading,
  currentView: state.currentView,
  sidebarOpen: state.sidebarOpen,
  hasUnsavedChanges: state.hasUnsavedChanges,
  lastModified: state.lastModified,
});

const selectActions = (state: QuizEditorUIState) => ({
  setCurrentQuiz: state.setCurrentQuiz,
  updateCurrentQuiz: state.updateCurrentQuiz,
  addQuestion: state.addQuestion,
  updateQuestion: state.updateQuestion,
  deleteQuestion: state.deleteQuestion,
  moveQuestion: state.moveQuestion,
  setEditing: state.setEditing,
  setLoading: state.setLoading,
  setCurrentView: state.setCurrentView,
  setSidebarOpen: state.setSidebarOpen,
  markAsModified: state.markAsModified,
  clearUnsavedChanges: state.clearUnsavedChanges,
  reset: state.reset,
});

// Selector hooks for better performance
export const useCurrentQuiz = () => useQuizEditorUIStore(selectCurrentQuiz);
export const useQuizEditorUIState = () => useQuizEditorUIStore(selectUIState);
export const useQuizEditorActions = () => useQuizEditorUIStore(selectActions);
