import { useAuth } from "@/contexts/auth-context";
import { flashcardService } from "@/lib/api/flashcard";
import type {
  CreateFlashcardSetRequest,
  UpdateFlashcardSetRequest,
} from "@/lib/api/flashcard";
import type { FlashcardApiResponse, FlashcardSet } from "@/types/flashcard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flashcardQueryKeys } from "../flashcard-query-keys";

// Helper function to create consistent query keys
function createFlashcardQueryKey(
  page: number,
  size: number,
  search?: string,
  sortBy?: string,
) {
  const baseKey = `page=${page}&size=${size}`;
  const searchParam = search?.trim() ? `&search=${search.trim()}` : "";
  const sortParam = sortBy ? `&sortBy=${sortBy}` : "";
  return flashcardQueryKeys.list(`${baseKey}${searchParam}${sortParam}`);
}

// Main hook for getting all flashcards with pagination, search and sort
export function useFlashcardsQuery(
  page = 0,
  size = 6,
  search?: string,
  sortBy?: string,
) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  // Create a stable query key that includes all parameters
  const queryKey = createFlashcardQueryKey(page, size, search, sortBy);

  const result = useQuery<FlashcardApiResponse, Error>({
    queryKey,
    queryFn: () =>
      flashcardService.getAllFlashcards(page, size, search, sortBy),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes - keep data fresh but allow caching
    gcTime: 30 * 60 * 1000, // 30 minutes - keep cached data longer
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Don't refetch if data exists in cache
  });

  // Prefetch next page for better UX (optional)
  const { data } = result;
  if (data?.pagination?.hasNext && accessToken) {
    const nextPageKey = createFlashcardQueryKey(page + 1, size, search, sortBy);
    queryClient.prefetchQuery({
      queryKey: nextPageKey,
      queryFn: () =>
        flashcardService.getAllFlashcards(page + 1, size, search, sortBy),
      staleTime: 5 * 60 * 1000,
    });
  }

  return result;
}

// Hook for getting public flashcards
export function usePublicFlashcards(page = 0, size = 6) {
  return useQuery<FlashcardApiResponse, Error>({
    queryKey: ["flashcards", "public", page, size],
    queryFn: () => flashcardService.getPublicFlashcards(page, size),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for getting a single flashcard by ID
export function useFlashcard(id: number | null) {
  return useQuery<FlashcardSet, Error>({
    queryKey: id
      ? flashcardQueryKeys.detail(id)
      : ["flashcards", "detail", "null"],
    queryFn: () => {
      if (!id) throw new Error("Flashcard ID is required");
      return flashcardService.getFlashcardById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for creating a new flashcard set
export function useCreateFlashcard() {
  const queryClient = useQueryClient();

  return useMutation<FlashcardSet, Error, CreateFlashcardSetRequest>({
    mutationFn: (data) => flashcardService.createFlashcardSet(data),
    onSuccess: () => {
      // Invalidate and refetch flashcard lists immediately
      queryClient.invalidateQueries({
        queryKey: flashcardQueryKeys.lists(),
        refetchType: "active", // Only refetch active queries
      });
      queryClient.invalidateQueries({
        queryKey: ["flashcards", "public"],
        refetchType: "active",
      });
    },
  });
}

// Hook for updating a flashcard set
export function useUpdateFlashcard() {
  const queryClient = useQueryClient();

  return useMutation<
    FlashcardSet,
    Error,
    { id: number; data: UpdateFlashcardSetRequest }
  >({
    mutationFn: ({ id, data }) => flashcardService.updateFlashcardSet(id, data),
    onSuccess: (updatedFlashcard, { id }) => {
      // Update the specific flashcard in cache
      queryClient.setQueryData(flashcardQueryKeys.detail(id), updatedFlashcard);

      // Invalidate lists to refresh immediately
      queryClient.invalidateQueries({
        queryKey: flashcardQueryKeys.lists(),
        refetchType: "active", // Only refetch active queries
      });
      queryClient.invalidateQueries({
        queryKey: ["flashcards", "public"],
        refetchType: "active",
      });
    },
  });
}

// Hook for deleting a flashcard set
export function useDeleteFlashcard() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => flashcardService.deleteFlashcardSet(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: flashcardQueryKeys.detail(deletedId),
      });

      // Invalidate lists to refresh immediately
      queryClient.invalidateQueries({
        queryKey: flashcardQueryKeys.lists(),
        refetchType: "active", // Only refetch active queries
      });
      queryClient.invalidateQueries({
        queryKey: ["flashcards", "public"],
        refetchType: "active",
      });
    },
  });
}

// Hook for calculating stats (utility function)
export function useFlashcardStats(
  flashcards: FlashcardSet[],
  totalElements?: number,
) {
  return flashcardService.calculateStats(flashcards, {
    totalElements: totalElements || 0,
  });
}
