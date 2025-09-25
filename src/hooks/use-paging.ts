import { useEffect, useState } from "react";
import type { IPagination } from "../types/group";

interface UsePaginationProps<T> {
  fetchData: (
    page: number,
    pageSize: number,
    keyword?: string,
  ) => Promise<{
    data: T[];
    pagination: IPagination;
  }>;
  pageSize?: number;
  initialKeyword?: string;
}

interface UsePaginationReturn<T> {
  items: T[];
  pagination: IPagination | undefined;
  isLoading: boolean;
  error: Error | null;
  setPage: (page: number) => void;
  setKeyword: (keyword: string) => void;
  debouncedKeyword: string;
  isSearching: boolean;
}

export function usePagination<T>({
  fetchData,
  pageSize = 8,
  initialKeyword = "",
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<IPagination>();
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  const [isSearching, setIsSearching] = useState(false);

  // Handle keyword debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword]);

  // Update searching state
  useEffect(() => {
    setIsSearching(keyword !== debouncedKeyword);
  }, [keyword, debouncedKeyword]);

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchData(page, pageSize, debouncedKeyword);
        setItems(response.data);
        setPagination(response.pagination);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch data"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchData, page, pageSize, debouncedKeyword]);

  return {
    items,
    pagination,
    isLoading,
    error,
    setPage,
    setKeyword,
    debouncedKeyword,
    isSearching,
  };
}
