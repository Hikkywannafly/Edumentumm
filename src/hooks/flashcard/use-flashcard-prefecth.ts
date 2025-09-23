"use client";

import type { FlashcardSet } from "@/types/flashcard";
import { useCallback, useEffect, useState } from "react";
import {
  useFlashcardsQuery,
  usePrefetchFlashcardList,
  usePublicFlashcards,
} from "./use-flashcards-query";

interface FlashcardPrefetchOptions {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  prefetchPageRange?: boolean;
  startPage?: number;
  endPage?: number;
  prefetchIds?: number[];
  autoPrefetchFromList?: boolean;
  maxDetailsPrefetch?: number;
}

export function useFlashcardPrefetch(options: FlashcardPrefetchOptions = {}) {
  const {
    prefetchFlashcards,
    prefetchFlashcard,
    prefetchPageRange,
    prefetchPublicFlashcards,
  } = usePrefetchFlashcardList();

  const {
    page = 0,
    size = 6,
    search,
    sortBy = "recent",
    prefetchPageRange: shouldPrefetchRange = false,
    startPage = 0,
    endPage = 2,
    prefetchIds = [],
    autoPrefetchFromList = false,
    maxDetailsPrefetch = 5,
  } = options;

  const prefetchMultipleIds = useCallback(
    async (ids: number[]) => {
      if (ids.length === 0) return;

      const prefetchPromises = ids.map((id) => prefetchFlashcard(id));
      await Promise.all(prefetchPromises);
    },
    [prefetchFlashcard],
  );

  const autoPrefetchDetailsFromList = useCallback(
    async (listResult: any, maxItems: number) => {
      if (!listResult?.flashcards?.length) return;

      const flashcards = listResult.flashcards;
      const idsToFetch = flashcards
        .slice(0, maxItems) // Giới hạn số lượng
        .map((flashcard: any) => flashcard.id)
        .filter((id: number) => id != null);

      if (idsToFetch.length > 0) {
        await prefetchMultipleIds(idsToFetch);
      }
    },
    [prefetchMultipleIds],
  );

  useEffect(() => {
    const performPrefetch = async () => {
      try {
        const listResult = await prefetchFlashcards(page, size, search, sortBy);

        await prefetchPublicFlashcards(page, size);

        if (shouldPrefetchRange) {
          await prefetchPageRange(startPage, endPage, size, search, sortBy);
        }

        // Prefetch specific IDs nếu được cung cấp
        if (prefetchIds.length > 0) {
          await prefetchMultipleIds(prefetchIds);
        }

        if (autoPrefetchFromList) {
          await autoPrefetchDetailsFromList(listResult, maxDetailsPrefetch);
        }
      } catch (error) {
        console.warn("Failed to prefetch flashcards:", error);
      }
    };

    performPrefetch();
  }, [
    prefetchFlashcards,
    prefetchPublicFlashcards,
    prefetchPageRange,
    page,
    size,
    search,
    sortBy,
    shouldPrefetchRange,
    startPage,
    endPage,
    prefetchIds,
    autoPrefetchFromList,
    maxDetailsPrefetch,
    prefetchMultipleIds,
    autoPrefetchDetailsFromList,
  ]);

  return {
    prefetchFlashcards,
    prefetchFlashcard,
    prefetchPageRange,
    prefetchPublicFlashcards,
    prefetchMultipleIds,
    autoPrefetchDetailsFromList,
  };
}

interface FlashcardPageDetailsPrefetchOptions {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  enabled?: boolean;
  prefetchOnPageLoad?: boolean;
  prefetchDelay?: number;
  batchSize?: number;
}

export function useFlashcardPageDetailsPrefetch(
  options: FlashcardPageDetailsPrefetchOptions = {},
) {
  const {
    page = 0,
    size = 6,
    search,
    sortBy = "recent",
    enabled = true,
    prefetchOnPageLoad = true,
    prefetchDelay = 500, // 500ms delay để không block UI
    batchSize = 3,
  } = options;

  const { prefetchFlashcard } = usePrefetchFlashcardList();
  const { data: flashcardsData, isLoading } = useFlashcardsQuery(
    page,
    size,
    search,
    sortBy,
  );

  // State to track prefetch progress
  const [prefetchStatus, setPrefetchStatus] = useState({
    isPrefetching: false,
    prefetchedCount: 0,
    totalCount: 0,
    failedIds: [] as number[],
  });

  // Function to prefetch details in batch
  const prefetchDetailsBatch = useCallback(
    async (flashcardIds: number[], startIndex = 0) => {
      if (!enabled || flashcardIds.length === 0) return;

      const totalCount = flashcardIds.length;
      setPrefetchStatus((prev) => ({
        ...prev,
        isPrefetching: true,
        totalCount,
        prefetchedCount: startIndex,
      }));

      try {
        // Process theo batch để tránh overwhelm network
        for (let i = startIndex; i < flashcardIds.length; i += batchSize) {
          const batch = flashcardIds.slice(i, i + batchSize);

          const batchPromises = batch.map(async (id) => {
            try {
              await prefetchFlashcard(id);
              return { id, success: true };
            } catch (error) {
              console.warn(`Failed to prefetch flashcard detail ${id}:`, error);
              return { id, success: false };
            }
          });

          const batchResults = await Promise.all(batchPromises);

          // Update progress
          const failedInBatch = batchResults
            .filter((result) => !result.success)
            .map((result) => result.id);

          setPrefetchStatus((prev) => ({
            ...prev,
            prefetchedCount: i + batch.length,
            failedIds: [...prev.failedIds, ...failedInBatch],
          }));

          // Small delay between batches to avoid spam
          if (i + batchSize < flashcardIds.length) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        console.info(
          `✅ Prefetched ${flashcardIds.length} flashcard details for page ${page}`,
        );
      } catch (error) {
        console.error("Failed to prefetch flashcard details batch:", error);
      } finally {
        setPrefetchStatus((prev) => ({
          ...prev,
          isPrefetching: false,
        }));
      }
    },
    [enabled, prefetchFlashcard, batchSize, page],
  );

  // Auto prefetch all details when data is available
  useEffect(() => {
    if (
      !enabled ||
      !prefetchOnPageLoad ||
      !flashcardsData?.data ||
      isLoading ||
      flashcardsData.data.length === 0
    ) {
      return;
    }

    const flashcardIds = flashcardsData.data.map((flashcard) => flashcard.id);

    const timeoutId = setTimeout(() => {
      prefetchDetailsBatch(flashcardIds);
    }, prefetchDelay);

    return () => clearTimeout(timeoutId);
  }, [
    enabled,
    prefetchOnPageLoad,
    flashcardsData?.data,
    isLoading,
    prefetchDelay,
    prefetchDetailsBatch,
  ]);

  // Function to retry prefetching failed items
  const retryFailedPrefetch = useCallback(async () => {
    if (prefetchStatus.failedIds.length === 0) return;

    console.info(
      `Retrying ${prefetchStatus.failedIds.length} failed prefetches...`,
    );
    await prefetchDetailsBatch(prefetchStatus.failedIds);
  }, [prefetchStatus.failedIds, prefetchDetailsBatch]);

  // Function to manually prefetch all details for the page
  const prefetchAllDetails = useCallback(async () => {
    if (!flashcardsData?.data) return;

    const flashcardIds = flashcardsData.data.map((flashcard) => flashcard.id);
    await prefetchDetailsBatch(flashcardIds);
  }, [flashcardsData?.data, prefetchDetailsBatch]);

  return {
    // Prefetch methods
    prefetchAllDetails,
    retryFailedPrefetch,
    prefetchDetailsBatch,
    // Status
    prefetchStatus,
    currentPageItemCount: flashcardsData?.data?.length || 0,
    isDataLoading: isLoading,
    isPrefetchEnabled: enabled,
    // Computed status
    isPrefetchComplete:
      !prefetchStatus.isPrefetching &&
      prefetchStatus.prefetchedCount === prefetchStatus.totalCount &&
      prefetchStatus.totalCount > 0,
    prefetchProgress:
      prefetchStatus.totalCount > 0
        ? (prefetchStatus.prefetchedCount / prefetchStatus.totalCount) * 100
        : 0,
  };
}

export function usePublicFlashcardDetailsPrefetch(
  options: Omit<
    FlashcardPageDetailsPrefetchOptions,
    "page" | "size" | "search" | "sortBy"
  > & {
    page?: number;
    size?: number;
  } = {},
) {
  const {
    enabled = true,
    prefetchOnPageLoad = true,
    prefetchDelay = 500,
    batchSize = 3,
    page = 0,
    size = 6,
  } = options;

  const { prefetchFlashcard } = usePrefetchFlashcardList();
  const { data: publicFlashcardsData, isLoading } = usePublicFlashcards(
    page,
    size,
  );

  // State to track prefetch progress
  const [prefetchStatus, setPrefetchStatus] = useState({
    isPrefetching: false,
    prefetchedCount: 0,
    totalCount: 0,
    failedIds: [] as number[],
  });

  // Function to prefetch details in batch
  const prefetchDetailsBatch = useCallback(
    async (flashcardIds: number[], startIndex = 0) => {
      if (!enabled || flashcardIds.length === 0) return;

      const totalCount = flashcardIds.length;
      setPrefetchStatus((prev) => ({
        ...prev,
        isPrefetching: true,
        totalCount,
        prefetchedCount: startIndex,
      }));

      try {
        // Process theo batch để tránh overwhelm network
        for (let i = startIndex; i < flashcardIds.length; i += batchSize) {
          const batch = flashcardIds.slice(i, i + batchSize);

          const batchPromises = batch.map(async (id) => {
            try {
              await prefetchFlashcard(id);
              return { id, success: true };
            } catch (error) {
              console.warn(
                `Failed to prefetch public flashcard detail ${id}:`,
                error,
              );
              return { id, success: false };
            }
          });

          const batchResults = await Promise.all(batchPromises);

          // Update progress
          const failedInBatch = batchResults
            .filter((result) => !result.success)
            .map((result) => result.id);

          setPrefetchStatus((prev) => ({
            ...prev,
            prefetchedCount: i + batch.length,
            failedIds: [...prev.failedIds, ...failedInBatch],
          }));

          // Small delay between batches to avoid spam
          if (i + batchSize < flashcardIds.length) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        console.info(
          `✅ Prefetched ${flashcardIds.length} public flashcard details for explore page`,
        );
      } catch (error) {
        console.error(
          "Failed to prefetch public flashcard details batch:",
          error,
        );
      } finally {
        setPrefetchStatus((prev) => ({
          ...prev,
          isPrefetching: false,
        }));
      }
    },
    [enabled, prefetchFlashcard, batchSize],
  );

  // Auto prefetch all details when data is available
  useEffect(() => {
    if (
      !enabled ||
      !prefetchOnPageLoad ||
      !publicFlashcardsData?.data ||
      isLoading ||
      publicFlashcardsData.data.length === 0
    ) {
      return;
    }

    const flashcardIds = publicFlashcardsData.data.map(
      (flashcard: FlashcardSet) => flashcard.id,
    );

    const timeoutId = setTimeout(() => {
      prefetchDetailsBatch(flashcardIds);
    }, prefetchDelay);

    return () => clearTimeout(timeoutId);
  }, [
    enabled,
    prefetchOnPageLoad,
    publicFlashcardsData?.data,
    isLoading,
    prefetchDelay,
    prefetchDetailsBatch,
  ]);

  // Function to retry prefetching failed items
  const retryFailedPrefetch = useCallback(async () => {
    if (prefetchStatus.failedIds.length === 0) return;

    console.info(
      `Retrying ${prefetchStatus.failedIds.length} failed public flashcard prefetches...`,
    );
    await prefetchDetailsBatch(prefetchStatus.failedIds);
  }, [prefetchStatus.failedIds, prefetchDetailsBatch]);

  // Function to manually prefetch all details
  const prefetchAllDetails = useCallback(async () => {
    if (!publicFlashcardsData?.data) return;

    const flashcardIds = publicFlashcardsData.data.map(
      (flashcard: FlashcardSet) => flashcard.id,
    );
    await prefetchDetailsBatch(flashcardIds);
  }, [publicFlashcardsData?.data, prefetchDetailsBatch]);

  return {
    // Prefetch methods
    prefetchAllDetails,
    retryFailedPrefetch,
    prefetchDetailsBatch,
    // Status
    prefetchStatus,
    currentPageItemCount: publicFlashcardsData?.data?.length || 0,
    isDataLoading: isLoading,
    isPrefetchEnabled: enabled,
    // Computed status
    isPrefetchComplete:
      !prefetchStatus.isPrefetching &&
      prefetchStatus.prefetchedCount === prefetchStatus.totalCount &&
      prefetchStatus.totalCount > 0,
    prefetchProgress:
      prefetchStatus.totalCount > 0
        ? (prefetchStatus.prefetchedCount / prefetchStatus.totalCount) * 100
        : 0,
  };
}
