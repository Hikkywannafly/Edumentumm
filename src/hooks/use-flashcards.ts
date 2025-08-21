import { useAuth } from "@/contexts/auth-context";
import { flashcardService } from "@/lib/api/flashcard";
import type {
  FlashcardSet,
  FlashcardStats,
  PaginationInfo,
} from "@/types/flashcard";
import { useCallback, useEffect, useState } from "react";

export function useFlashcards(page = 1, size = 6) {
  const { accessToken } = useAuth();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 6,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [stats, setStats] = useState<FlashcardStats>({
    totalFlashcards: 0,
    totalDecks: 0,
    averageScore: 0,
    studyTime: "0h",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = useCallback(
    async (currentPage = page, currentSize = size) => {
      if (!accessToken) {
        setIsLoading(false);
        setError("No access token available");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Convert UI page (1-based) to API page (0-based)
        const apiPage = currentPage - 1;
        const response = await flashcardService.getAllFlashcards(
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

        const calculatedStats = flashcardService.calculateStats(
          response.data,
          uiPagination,
        );
        setStats(calculatedStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, page, size],
  );

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  return {
    flashcardSets,
    pagination,
    stats,
    isLoading,
    error,
    refetch: fetchFlashcards,
  };
}
