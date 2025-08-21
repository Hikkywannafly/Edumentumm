import { flashcardService } from "@/lib/api/flashcard";
import type { FlashcardSet, PaginationInfo } from "@/types/flashcard";
import { useCallback, useEffect, useState } from "react";

export function usePublicFlashcards(page = 1, size = 6) {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 6,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicFlashcards = useCallback(
    async (currentPage = page, currentSize = size) => {
      try {
        setIsLoading(true);
        setError(null);

        // Convert UI page (1-based) to API page (0-based)
        const apiPage = currentPage - 1;
        const response = await flashcardService.getPublicFlashcards(
          apiPage,
          currentSize,
        );
        setFlashcardSets(response.data);

        // Convert API pagination (0-based) to UI pagination (1-based)
        const uiPagination = {
          ...response.pagination,
          currentPage: response.pagination.currentPage + 1,
        };
        setPagination(uiPagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [page, size],
  );

  useEffect(() => {
    fetchPublicFlashcards();
  }, [fetchPublicFlashcards]);

  return {
    flashcardSets,
    pagination,
    isLoading,
    error,
    refetch: fetchPublicFlashcards,
  };
}
