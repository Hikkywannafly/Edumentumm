"use client";

import { useEffect } from "react";
import { usePrefetchQuizList } from "./use-quiz-list";

/**
 * Hook to prefetch quiz data when the dashboard loads
 * This improves the user experience by preloading data for the quizzes page
 */
export function useQuizPrefetch() {
  const prefetchQuizList = usePrefetchQuizList();

  useEffect(() => {
    // Prefetch the first page of quizzes with default parameters
    prefetchQuizList({
      page: 0,
      size: 10,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
  }, [prefetchQuizList]);
}
