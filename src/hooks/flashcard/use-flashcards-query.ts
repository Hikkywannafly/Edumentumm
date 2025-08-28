import { useAuth } from "@/contexts/auth-context";
import { flashcardService } from "@/lib/api/flashcard";
import type {
  CreateFlashcardSetRequest,
  UpdateFlashcardSetRequest,
} from "@/lib/api/flashcard";
import type { FlashcardApiResponse, FlashcardSet } from "@/types/flashcard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flashcardQueryKeys } from "../flashcard-query-keys";

// Main hook for getting all flashcards with pagination
export function useFlashcardsQuery(page = 0, size = 6) {
  const { accessToken } = useAuth();

  return useQuery<FlashcardApiResponse, Error>({
    queryKey: flashcardQueryKeys.list(`page=${page}&size=${size}`),
    queryFn: () => flashcardService.getAllFlashcards(page, size),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
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
      // Invalidate and refetch flashcard lists
      queryClient.invalidateQueries({
        queryKey: flashcardQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ["flashcards", "public"],
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

      // Invalidate lists to refresh
      queryClient.invalidateQueries({
        queryKey: flashcardQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ["flashcards", "public"],
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

      // Invalidate lists to refresh
      queryClient.invalidateQueries({
        queryKey: flashcardQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ["flashcards", "public"],
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
