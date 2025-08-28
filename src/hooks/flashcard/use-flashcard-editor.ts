import { useToast } from "@/hooks/use-toast";
import type { CreateFlashcardSetRequest } from "@/lib/api/flashcard";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { useFlashcardEditorStore } from "@/stores/flashcard-editor-store";
import { useCreateFlashcard, useUpdateFlashcard } from "./use-flashcards-query";

/**
 * Enhanced hook for flashcard editor with React Query mutations
 */
export function useFlashcardEditor() {
  const { toast } = useToast();
  const { goFlashcards } = useLocalizedNavigation();
  const { flashcardData, setEditing } = useFlashcardEditorStore();

  // React Query mutations
  const createFlashcardMutation = useCreateFlashcard();
  const updateFlashcardMutation = useUpdateFlashcard();

  // Derived state
  const isUpdate = !!flashcardData?.id;
  const isSaving =
    createFlashcardMutation.isPending || updateFlashcardMutation.isPending;

  // Validation helper
  const validateFlashcardData = () => {
    if (!flashcardData)
      return { isValid: false, error: "No flashcard data found" };

    if (!flashcardData.title.trim()) {
      return {
        isValid: false,
        error: "Please enter a title for your flashcard set",
      };
    }

    if (flashcardData.flashcards.length === 0) {
      return { isValid: false, error: "Please add at least one flashcard" };
    }

    // Validate each flashcard
    for (let i = 0; i < flashcardData.flashcards.length; i++) {
      const flashcard = flashcardData.flashcards[i];
      if (!flashcard.question.trim()) {
        return {
          isValid: false,
          error: `Please enter a question for flashcard ${i + 1}`,
        };
      }
      if (flashcard.choices.some((choice) => !choice.trim())) {
        return {
          isValid: false,
          error: `Please fill in all choices for flashcard ${i + 1}`,
        };
      }
    }

    return { isValid: true };
  };

  // Error handler
  const handleMutationError = (
    error: Error,
    operation: "create" | "update",
  ) => {
    let errorMessage = `Failed to ${operation} flashcard set`;

    if (error.message.includes("network") || error.message.includes("fetch")) {
      errorMessage =
        "Network error. Please check your connection and try again.";
    } else if (
      error.message.includes("401") ||
      error.message.includes("unauthorized")
    ) {
      errorMessage = "You need to be logged in to save flashcards.";
    } else if (
      error.message.includes("403") ||
      error.message.includes("forbidden")
    ) {
      errorMessage = "You don't have permission to perform this action.";
    } else if (
      error.message.includes("400") ||
      error.message.includes("validation")
    ) {
      errorMessage = "Invalid data. Please check your flashcard content.";
    } else {
      errorMessage = error.message;
    }

    toast({
      title: `${operation === "create" ? "Create" : "Update"} Error`,
      description: errorMessage,
      variant: "destructive",
    });
  };

  // Success handler
  const handleMutationSuccess = (operation: "create" | "update") => {
    toast({
      title: "Success!",
      description: `Your flashcard set has been ${operation}d successfully`,
    });

    // Clear editor state and navigate back
    setEditing(false);
    goFlashcards();
  };

  // Main save function
  const saveFlashcard = () => {
    if (!flashcardData) return;

    // Validate data first
    const validation = validateFlashcardData();
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    if (isUpdate) {
      // Update existing flashcard set
      const updateRequest = {
        title: flashcardData.title.trim(),
        description: flashcardData.description.trim(),
        isPublic: false, // Can be made configurable later
        flashcards: flashcardData.flashcards.map((flashcard) => ({
          id: flashcard.id as number,
          question: flashcard.question.trim(),
          choices: flashcard.choices.map((choice) => choice.trim()),
          correctAnswer: flashcard.correctAnswer,
          explanation: flashcard.explanation?.trim() || "",
        })),
      };

      updateFlashcardMutation.mutate(
        {
          id: flashcardData.id as number,
          data: updateRequest,
        },
        {
          onSuccess: () => handleMutationSuccess("update"),
          onError: (error) => handleMutationError(error, "update"),
        },
      );
    } else {
      // Create new flashcard set
      const createRequest: CreateFlashcardSetRequest = {
        title: flashcardData.title.trim(),
        description: flashcardData.description.trim(),
        isPublic: false, // Default to private, can be made configurable later
        flashcards: flashcardData.flashcards.map((flashcard) => ({
          question: flashcard.question.trim(),
          choices: flashcard.choices.map((choice) => choice.trim()),
          correctAnswer: flashcard.correctAnswer,
          explanation: flashcard.explanation?.trim() || "",
        })),
      };

      createFlashcardMutation.mutate(createRequest, {
        onSuccess: () => handleMutationSuccess("create"),
        onError: (error) => handleMutationError(error, "create"),
      });
    }
  };

  // Auto-save helper (for future implementation)
  const autoSave = () => {
    // Could implement auto-save functionality here
    // This would save as draft without navigation
  };

  return {
    // State
    flashcardData,
    isUpdate,
    isSaving,

    // Mutations
    createFlashcard: createFlashcardMutation,
    updateFlashcard: updateFlashcardMutation,

    // Actions
    saveFlashcard,
    autoSave,

    // Helpers
    validateFlashcardData,

    // Status
    canSave: !!flashcardData && !isSaving,
  };
}
