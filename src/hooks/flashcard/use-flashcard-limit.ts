import { apiClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { flashcardQueryKeys } from "../flashcard-query-keys";

interface FlashcardLimitData {
  canCreateFlashcard: boolean;
  flashcardSetsCreatedThisWeek: number;
  weeklyLimit: number;
}

export function useFlashcardLimit() {
  return useQuery<FlashcardLimitData>({
    queryKey: flashcardQueryKeys.limit(),
    queryFn: async () => {
      const response = await apiClient.get("/student/flashcards/limit");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
