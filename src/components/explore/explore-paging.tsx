import FlashcardPagination from "@/components/flashcards/flashcard-pagination";
import type { PaginationInfo } from "@/types/flashcard";
import { Card } from "../ui";

interface ExplorePagingProps {
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  show?: boolean;
}

export default function ExplorePaging({
  pagination,
  onPageChange,
  show = false,
}: ExplorePagingProps) {
  if (!show || !pagination || !onPageChange || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <Card className="border-none py-6">
      <FlashcardPagination
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </Card>
  );
}
