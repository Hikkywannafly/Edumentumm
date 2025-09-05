import { useAuth } from "@/contexts/auth-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface FlashcardCategory {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateFlashcardCategoryRequest {
  name: string;
  description?: string;
}

export interface FlashcardCategoriesApiResponse {
  status: string;
  message: string;
  data: FlashcardCategory[];
}

// Query keys
export const flashcardCategoryQueryKeys = {
  all: ["flashcard-categories"] as const,
  lists: () => [...flashcardCategoryQueryKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...flashcardCategoryQueryKeys.lists(), { filters }] as const,
};

// API functions
const fetchFlashcardCategories = async (
  accessToken: string,
): Promise<FlashcardCategory[]> => {
  const response = await fetch("/api/flashcard-categories", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch flashcard categories");
  }

  const data: FlashcardCategoriesApiResponse = await response.json();
  return data.data;
};

const createFlashcardCategory = async (
  categoryData: CreateFlashcardCategoryRequest,
  accessToken: string,
): Promise<FlashcardCategory> => {
  const response = await fetch("/api/flashcard-categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    throw new Error("Failed to create flashcard category");
  }

  const data: { data: FlashcardCategory; status: string; message: string } =
    await response.json();
  return data.data;
};

const deleteFlashcardCategory = async (
  categoryId: number,
  accessToken: string,
): Promise<void> => {
  const response = await fetch(`/api/flashcard-categories/${categoryId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete flashcard category");
  }
};

// React Query hooks
export function useFlashcardCategories() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: flashcardCategoryQueryKeys.lists(),
    queryFn: () => fetchFlashcardCategories(accessToken || ""),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateFlashcardCategory() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData: CreateFlashcardCategoryRequest) =>
      createFlashcardCategory(categoryData, accessToken || ""),
    onSuccess: (newCategory) => {
      // Update the categories list in cache
      queryClient.setQueryData(
        flashcardCategoryQueryKeys.lists(),
        (oldCategories: FlashcardCategory[] | undefined) => {
          if (!oldCategories) return [newCategory];
          return [...oldCategories, newCategory];
        },
      );
    },
    onError: (error) => {
      console.error("Error creating flashcard category:", error);
    },
  });
}

export function useDeleteFlashcardCategory() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: number) =>
      deleteFlashcardCategory(categoryId, accessToken || ""),
    onSuccess: (_, deletedCategoryId) => {
      // Remove the category from cache
      queryClient.setQueryData(
        flashcardCategoryQueryKeys.lists(),
        (oldCategories: FlashcardCategory[] | undefined) => {
          if (!oldCategories) return [];
          return oldCategories.filter((cat) => cat.id !== deletedCategoryId);
        },
      );
    },
    onError: (error) => {
      console.error("Error deleting flashcard category:", error);
    },
  });
}
