import type { BackendQuizEntity } from "@/types/quiz";
import { create } from "zustand";

interface QuizCacheState {
  cachedQuizzes: Map<number, BackendQuizEntity>;
  cacheQuiz: (quiz: BackendQuizEntity) => void;
  getCachedQuiz: (id: number) => BackendQuizEntity | null;
  clearCache: () => void;
  removeFromCache: (id: number) => void;
}

export const useQuizCacheStore = create<QuizCacheState>((set, get) => ({
  cachedQuizzes: new Map(),

  cacheQuiz: (quiz: BackendQuizEntity) => {
    set((state) => {
      const newCache = new Map(state.cachedQuizzes);
      if (quiz.id) {
        newCache.set(quiz.id, quiz);
      }
      return { cachedQuizzes: newCache };
    });
  },

  getCachedQuiz: (id: number) => {
    return get().cachedQuizzes.get(id) || null;
  },

  clearCache: () => {
    set({ cachedQuizzes: new Map() });
  },

  removeFromCache: (id: number) => {
    set((state) => {
      const newCache = new Map(state.cachedQuizzes);
      newCache.delete(id);
      return { cachedQuizzes: newCache };
    });
  },
}));
