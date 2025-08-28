import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { flashcardQueryKeys } from "../flashcard-query-keys";
import { useFlashcard } from "./use-flashcards-query";

/**
 * Enhanced hook for flashcard study view with additional optimizations
 */
export function useFlashcardStudy(flashcardSetId: number) {
  const queryClient = useQueryClient();

  // Get the main flashcard data
  const flashcardQuery = useFlashcard(flashcardSetId);

  // Prefetch related flashcards for better UX
  useEffect(() => {
    if (flashcardQuery.isSuccess && flashcardQuery.data) {
      // Prefetch the next few flashcards from the same user/category
      // This is optional and can be removed if not needed
      const prefetchRelated = async () => {
        try {
          // Could prefetch user's other flashcard sets here
          // For now, we'll just ensure the current one is cached properly
          queryClient.setQueryData(
            flashcardQueryKeys.detail(flashcardSetId),
            flashcardQuery.data,
          );
        } catch (error) {
          console.warn("Failed to prefetch related flashcards:", error);
        }
      };

      prefetchRelated();
    }
  }, [
    flashcardQuery.isSuccess,
    flashcardQuery.data,
    flashcardSetId,
    queryClient,
  ]);

  // Return enhanced query result with additional helpers
  return {
    ...flashcardQuery,
    // Add study-specific helpers
    hasFlashcards: Boolean(flashcardQuery.data?.flashcards?.length),
    totalCards: flashcardQuery.data?.flashcards?.length || 0,
    // Retry function for better UX
    retry: () => flashcardQuery.refetch(),
  };
}

/**
 * Hook for tracking study progress (placeholder for future implementation)
 */
export function useStudyProgress(_flashcardSetId: number) {
  // This could track user's progress through the flashcard set
  // For now, return basic structure
  return {
    currentCardIndex: 0,
    completedCards: 0,
    totalCards: 0,
    progress: 0,
    // Methods to update progress
    markCardCompleted: () => {},
    resetProgress: () => {},
  };
}
