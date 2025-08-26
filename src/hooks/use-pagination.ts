import { useCallback, useState } from "react";

interface UsePaginationProps {
  initialPage?: number; // UI page (1-based)
  initialSize?: number;
  onPageChange?: (page: number, size: number) => void;
}

export function usePagination({
  initialPage = 1, // UI pagination starts from 1
  initialSize = 6,
  onPageChange,
}: UsePaginationProps = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      onPageChange?.(page, pageSize);
    },
    [pageSize, onPageChange],
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when changing page size
      onPageChange?.(1, size);
    },
    [onPageChange],
  );

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialSize);
  }, [initialPage, initialSize]);

  return {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    reset,
  };
}
