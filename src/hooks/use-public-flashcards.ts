import { flashcardService } from "@/lib/api/flashcard";
import type { FlashcardSet } from "@/types/flashcard";
import { useCallback, useEffect, useState } from "react";

export function usePublicFlashcards() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicFlashcards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await flashcardService.getPublicFlashcards();
      setFlashcardSets(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicFlashcards();
  }, [fetchPublicFlashcards]);

  return {
    flashcardSets,
    isLoading,
    error,
    refetch: fetchPublicFlashcards,
  };
}
