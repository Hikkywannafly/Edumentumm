export const flashcardQueryKeys = {
  all: ["flashcards"] as const,
  lists: () => [...flashcardQueryKeys.all, "list"] as const,
  list: (filters: string) =>
    [...flashcardQueryKeys.lists(), { filters }] as const,
  details: () => [...flashcardQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...flashcardQueryKeys.details(), id] as const,
  generateFlashcards: (content: string, settings?: any) =>
    [...flashcardQueryKeys.all, "generate", { content, settings }] as const,
  extractFlashcards: (content: string, settings?: any) =>
    [...flashcardQueryKeys.all, "extract", { content, settings }] as const,
  titleDescription: (content: string, flashcards: any[], options?: any) =>
    [
      ...flashcardQueryKeys.all,
      "title-description",
      { content, flashcards, options },
    ] as const,
  limit: () => [...flashcardQueryKeys.all, "limit"] as const,
};
