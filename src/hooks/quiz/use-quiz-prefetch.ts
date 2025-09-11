"use client";

import { useEffect } from "react";
import { usePrefetchQuizList } from "./use-quiz-list";

export function useQuizPrefetch() {
  const prefetchQuizList = usePrefetchQuizList();

  useEffect(() => {
    prefetchQuizList(
      {
        page: 0,
        size: 6,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
      {
        prefetchDetails: true,
        prefetchEditor: true,
      },
    );
  }, [prefetchQuizList]);
}
