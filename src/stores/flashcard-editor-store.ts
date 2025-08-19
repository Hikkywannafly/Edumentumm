import type { FlashcardData } from "@/types/flashcard";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "processing" | "success" | "error";
  progress: number;
  error?: string;
  parsedContent?: string;
  extractedFlashcards?: FlashcardData[];
  actualFile?: File;
}

export interface GeneratedFlashcardSet {
  id?: number; // Optional ID for existing flashcard sets
  title: string;
  description: string;
  flashcards: FlashcardData[];
  metadata?: {
    total_cards: number;
    difficulty?: string;
    estimated_study_time?: number; // minutes
    tags?: string[];
    category?: string;
    subject?: string;
    grade_level?: string;
  };
}

interface FlashcardEditorState {
  flashcardData: GeneratedFlashcardSet | null;

  isEditing: boolean;
  isLoading: boolean;

  setFlashcardData: (flashcardSet: GeneratedFlashcardSet) => void;
  updateFlashcardData: (updates: Partial<GeneratedFlashcardSet>) => void;
  createBlankFlashcardSet: (title?: string, description?: string) => void;
  addFlashcard: (flashcard: FlashcardData) => void;
  addFlashcardAfter: (afterIndex: number, flashcard: FlashcardData) => void;
  updateFlashcard: (
    flashcardId: number,
    updates: Partial<FlashcardData>,
  ) => void;
  deleteFlashcard: (flashcardId: number) => void;
  moveFlashcard: (fromIndex: number, toIndex: number) => void;
  setEditing: (editing: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useFlashcardEditorStore = create<FlashcardEditorState>()(
  persist(
    (set, get) => ({
      flashcardData: null,
      isEditing: false,
      isLoading: false,

      setFlashcardData: (flashcardSet) => {
        set({ flashcardData: flashcardSet });
      },

      createBlankFlashcardSet: (
        title = "New Flashcard Set",
        description = "Create your own flashcard set",
      ) => {
        const blankFlashcardSet: GeneratedFlashcardSet = {
          title,
          description,
          flashcards: [
            {
              id: Date.now(),
              question: "Enter your first flashcard question here",
              choices: ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: 0,
              explanation: "Enter explanation for the correct answer",
            },
          ],
          metadata: {
            total_cards: 1,
            difficulty: "medium",
            estimated_study_time: 1,
          },
        };
        set({
          flashcardData: blankFlashcardSet,
          isEditing: true,
        });
      },

      updateFlashcardData: (updates) => {
        const current = get().flashcardData;
        if (!current) return;

        set({
          flashcardData: {
            ...current,
            ...updates,
          },
        });
      },

      addFlashcard: (flashcard) => {
        const current = get().flashcardData;
        if (!current) return;

        // Ensure unique ID
        const newFlashcard = {
          ...flashcard,
          id: flashcard.id || Date.now() + Math.random(),
        };

        set({
          flashcardData: {
            ...current,
            flashcards: [...current.flashcards, newFlashcard],
            metadata: {
              ...current.metadata,
              total_cards: current.flashcards.length + 1,
            },
          },
        });
      },

      addFlashcardAfter: (afterIndex, flashcard) => {
        const current = get().flashcardData;
        if (!current) return;

        // Ensure unique ID
        const newFlashcard = {
          ...flashcard,
          id: flashcard.id || Date.now() + Math.random(),
        };

        const newFlashcards = [...current.flashcards];
        newFlashcards.splice(afterIndex + 1, 0, newFlashcard);

        set({
          flashcardData: {
            ...current,
            flashcards: newFlashcards,
            metadata: {
              ...current.metadata,
              total_cards: newFlashcards.length,
            },
          },
        });
      },

      updateFlashcard: (flashcardId, updates) => {
        const current = get().flashcardData;
        if (!current) return;

        const flashcardIndex = current.flashcards.findIndex(
          (fc) => fc.id === flashcardId,
        );
        if (flashcardIndex === -1) return;

        const newFlashcards = [...current.flashcards];
        newFlashcards[flashcardIndex] = {
          ...newFlashcards[flashcardIndex],
          ...updates,
        };

        set({
          flashcardData: {
            ...current,
            flashcards: newFlashcards,
          },
        });
      },

      deleteFlashcard: (flashcardId) => {
        const current = get().flashcardData;
        if (!current) return;

        const newFlashcards = current.flashcards.filter(
          (fc) => fc.id !== flashcardId,
        );

        set({
          flashcardData: {
            ...current,
            flashcards: newFlashcards,
            metadata: {
              ...current.metadata,
              total_cards: newFlashcards.length,
            },
          },
        });
      },

      moveFlashcard: (fromIndex, toIndex) => {
        const current = get().flashcardData;
        if (!current) return;

        const newFlashcards = [...current.flashcards];
        const [movedFlashcard] = newFlashcards.splice(fromIndex, 1);
        newFlashcards.splice(toIndex, 0, movedFlashcard);

        set({
          flashcardData: {
            ...current,
            flashcards: newFlashcards,
          },
        });
      },

      setEditing: (editing) => set({ isEditing: editing }),
      setLoading: (loading) => set({ isLoading: loading }),

      reset: () => {
        set({
          flashcardData: null,
          isEditing: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "flashcard-editor-store",
      partialize: (state) => ({
        flashcardData: state.flashcardData,
        isEditing: state.isEditing,
      }),
      onRehydrateStorage: () => {
        // Clean up old localStorage key when store is rehydrated
        return () => {
          try {
            localStorage.removeItem("flashcard-editor-storage");
          } catch (error) {
            console.warn("Failed to clean up old localStorage key:", error);
          }
        };
      },
    },
  ),
);
