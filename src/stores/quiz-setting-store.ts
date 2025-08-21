import type {
  Difficulty,
  FileProcessingMode,
  GenerationMode,
  Language,
  ParsingMode,
  QuestionType,
  QuizMode,
  Task,
  Visibility,
} from "@/types/quiz";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface QuizSettings {
  generationMode: GenerationMode;
  fileProcessingMode: FileProcessingMode;

  visibility: Visibility;
  language: Language;
  questionType: QuestionType | "MIXED";
  numberOfQuestions: number;
  mode: QuizMode;
  difficulty: Difficulty;
  task: Task;
  parsingMode: ParsingMode;

  // Quiz rules
  passingScore: number;
  timeLimit?: number;
  randomizeQuestions: boolean;
  showExplanations: boolean;
  allowRetry: boolean;
}

interface QuizSettingsState {
  settings: QuizSettings;

  // Actions
  updateSettings: (updates: Partial<QuizSettings>) => void;
  resetSettings: () => void;

  // Individual setters for common use
  setGenerationMode: (mode: GenerationMode) => void;
  setVisibility: (visibility: Visibility) => void;
  setLanguage: (language: Language) => void;
  setQuestionType: (type: QuestionType | "MIXED") => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setNumberOfQuestions: (count: number) => void;
}

const DEFAULT_SETTINGS: QuizSettings = {
  generationMode: "GENERATE",
  fileProcessingMode: "PARSE_THEN_SEND",
  visibility: "PRIVATE",
  language: "AUTO",
  questionType: "MULTIPLE_CHOICE",
  numberOfQuestions: 5,
  mode: "QUIZ",
  difficulty: "MEDIUM",
  task: "GENERATE_QUIZ",
  parsingMode: "BALANCED",
  passingScore: 70,
  randomizeQuestions: false,
  showExplanations: true,
  allowRetry: true,
};

export const useQuizSettingsStore = create<QuizSettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      // Individual setters
      setGenerationMode: (mode) =>
        set((state) => ({
          settings: { ...state.settings, generationMode: mode },
        })),

      setVisibility: (visibility) =>
        set((state) => ({
          settings: { ...state.settings, visibility },
        })),

      setLanguage: (language) =>
        set((state) => ({
          settings: { ...state.settings, language },
        })),

      setQuestionType: (questionType) =>
        set((state) => ({
          settings: { ...state.settings, questionType },
        })),

      setDifficulty: (difficulty) =>
        set((state) => ({
          settings: { ...state.settings, difficulty },
        })),

      setNumberOfQuestions: (numberOfQuestions) =>
        set((state) => ({
          settings: { ...state.settings, numberOfQuestions },
        })),
    }),
    {
      name: "quiz-settings-storage",
    },
  ),
);
