import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { IPagination } from "../../types/group";

type GroupPagingProps = {
  pagination?: IPagination;
  pageIndex?: (index: number) => void;
};

export default function GroupPaging({
  pagination,
  pageIndex = () => {},
}: GroupPagingProps) {
  return (
    <section>
      <Pagination>
        <PaginationContent>
          <PaginationItem onClick={() => pageIndex(0)}>
            <PaginationPrevious href="#" />
          </PaginationItem>
          {pagination?.totalPages &&
            Array.from({ length: pagination.totalPages }, (_, index) => (
              <PaginationItem onClick={() => pageIndex(index)} key={index}>
                <PaginationLink
                  href="#"
                  className="text-sm"
                  isActive={index === pagination.currentPage}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
          {pagination?.hasNext && (
            <PaginationItem
              onClick={() => pageIndex(pagination.currentPage + 1)}
            >
              <PaginationNext href="#" />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </section>
  );
}
