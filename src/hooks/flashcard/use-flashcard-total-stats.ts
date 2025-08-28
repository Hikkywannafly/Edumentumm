import { flashcardService } from "@/lib/api/flashcard";
import { useQuery } from "@tanstack/react-query";

// Hook to get total stats across all flashcards
export function useFlashcardTotalStats() {
  return useQuery({
    queryKey: ["flashcards", "total-stats"],
    queryFn: async () => {
      // Fetch all flashcards without pagination to calculate total stats
      const response = await flashcardService.getAllFlashcards(0, 1000); // Large size to get all

      const totalFlashcards = response.data.reduce(
        (sum, deck) => sum + deck.flashcards.length,
        0,
      );

      return {
        totalFlashcards,
        totalDecks: response.pagination.totalElements,
        averageScore: 0, // Placeholder
        studyTime: "0h", // Placeholder
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - stats don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
