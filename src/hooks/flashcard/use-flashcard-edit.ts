import type { UpdateFlashcardSetRequest } from "@/lib/api/flashcard";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import type { FlashcardData } from "@/types/flashcard";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { flashcardQueryKeys } from "../flashcard-query-keys";
import {
  useDeleteFlashcard,
  useFlashcard,
  useUpdateFlashcard,
} from "./use-flashcards-query";

/**
 * Enhanced hook for flashcard editing with React Query mutations
 */
export function useFlashcardEdit(flashcardSetId: number) {
  const queryClient = useQueryClient();
  const { goFlashcards } = useLocalizedNavigation();

  // Get flashcard data
  const flashcardQuery = useFlashcard(flashcardSetId);

  // Mutations
  const updateMutation = useUpdateFlashcard();
  const deleteMutation = useDeleteFlashcard();

  // Local editing state
  const [isDirty, setIsDirty] = useState(false);

  // Update flashcard set
  const updateFlashcardSet = async (data: UpdateFlashcardSetRequest) => {
    const result = await updateMutation.mutateAsync({
      id: flashcardSetId,
      data,
    });

    setIsDirty(false);
    return result;
  };

  // Delete flashcard set
  const deleteFlashcardSet = async () => {
    await deleteMutation.mutateAsync(flashcardSetId);
    // Navigate away after successful deletion
    goFlashcards();
  };

  // Save with current data
  const saveFlashcard = async (
    title: string,
    description: string,
    flashcards: FlashcardData[],
    isPublic: boolean,
  ) => {
    return updateFlashcardSet({
      title,
      description,
      flashcards: flashcards.map(({ id, ...rest }) => rest), // Remove temporary IDs
      isPublic,
    });
  };

  // Publish (save as public)
  const publishFlashcard = async (
    title: string,
    description: string,
    flashcards: FlashcardData[],
  ) => {
    return updateFlashcardSet({
      title,
      description,
      flashcards: flashcards.map(({ id, ...rest }) => rest),
      isPublic: true,
    });
  };

  // Optimistic update for better UX
  const optimisticUpdate = (
    updatedData: Partial<UpdateFlashcardSetRequest>,
  ) => {
    const currentData = flashcardQuery.data;
    if (currentData) {
      queryClient.setQueryData(flashcardQueryKeys.detail(flashcardSetId), {
        ...currentData,
        ...updatedData,
      });
    }
    setIsDirty(true);
  };

  return {
    // Data
    flashcardSet: flashcardQuery.data,
    isLoading: flashcardQuery.isLoading,
    error: flashcardQuery.error,

    // Mutations
    updateFlashcardSet,
    deleteFlashcardSet,
    saveFlashcard,
    publishFlashcard,
    optimisticUpdate,

    // States
    isSaving: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDirty,
    setIsDirty,

    // Errors
    saveError: updateMutation.error,
    deleteError: deleteMutation.error,

    // Utils
    refetch: flashcardQuery.refetch,
    reset: () => {
      updateMutation.reset();
      deleteMutation.reset();
      setIsDirty(false);
    },
  };
}
