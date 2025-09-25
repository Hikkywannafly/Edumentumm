"use client";

import {
  convertToDisplayData,
  useDeleteQuiz,
  usePrefetchQuizDetail,
  usePrefetchQuizEditor,
  usePrefetchQuizList,
  useQuizList,
  useQuizStats,
} from "@/hooks/quiz/use-quiz-list";
import type { QuizDisplayData } from "@/types/quiz-display";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "sonner";
import WideContainer from "../layout/wide-layout";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { EmptyState } from "./empty-state";
import { QuizCard } from "./quiz-card";
import { QuizFilters } from "./quiz-filters";
import { QuizStatsDisplay, QuizStatsDisplaySkeleton } from "./quiz-stats";

interface QuizFiltersState {
  search: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  visibility?: "PUBLIC" | "PRIVATE";
  sortBy: string;
  sortDirection: "asc" | "desc";
}

export function QuizzesContent() {
  const t = useTranslations("Quizzes");
  const router = useRouter();

  // Prefetch hooks
  const prefetchQuizList = usePrefetchQuizList();
  const prefetchQuizDetail = usePrefetchQuizDetail();
  const prefetchQuizEditor = usePrefetchQuizEditor();

  // Filter state
  const [filters, setFilters] = useState<QuizFiltersState>({
    search: "",
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6;
  const {
    data: quizListData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuizList({
    page: currentPage,
    size: pageSize,
    search: filters.search || undefined,
    difficulty: filters.difficulty,
    status: filters.status,
    visibility: filters.visibility,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
  });

  // Fetch quiz stats
  const { data: stats, isLoading: isStatsLoading } = useQuizStats();

  // Delete quiz mutation
  const deleteMutation = useDeleteQuiz();

  // Prefetch next page when current page loads
  useEffect(() => {
    if (quizListData && !isFetching) {
      // Prefetch details and editor data for quizzes in current page
      for (const quiz of quizListData.content) {
        prefetchQuizDetail(quiz.id);
        prefetchQuizEditor(String(quiz.id));
      }

      const totalPages = quizListData.totalPages;
      if (currentPage < totalPages - 1) {
        // Prefetch next page
        prefetchQuizList(
          {
            page: currentPage + 1,
            size: pageSize,
            search: filters.search || undefined,
            difficulty: filters.difficulty,
            status: filters.status,
            visibility: filters.visibility,
            sortBy: filters.sortBy,
            sortDirection: filters.sortDirection,
          },
          {
            prefetchDetails: true,
            prefetchEditor: true,
          },
        );
      }
    }
  }, [
    quizListData,
    isFetching,
    currentPage,
    filters,
    prefetchQuizList,
    prefetchQuizDetail,
    prefetchQuizEditor,
  ]);

  // Event handlers
  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
    setCurrentPage(0); // Reset to first page when searching
  };

  const handleFilter = () => {
    console.log("Filter clicked");
  };

  const handleQuizDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Quiz deleted successfully");
      },
      onError: (error) => {
        toast.error(`Failed to delete quiz: ${error.message}`);
      },
    });
  };

  const handleQuizEdit = (quiz: QuizDisplayData) => {
    // Prefetch quiz editor data
    prefetchQuizEditor(String(quiz.id));
    router.push(`/quizzes/${quiz.slug}-${quiz.id}/edit`);
  };

  const handleQuizView = (quiz: QuizDisplayData) => {
    // Prefetch quiz detail data
    prefetchQuizDetail(quiz.id);
    router.push(`/quizzes/${quiz.slug}-${quiz.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <WideContainer classNames="flex-1 space-y-6 p-6">
        <QuizFilters
          onSearch={handleSearch}
          onFilter={handleFilter}
          searchPlaceholder={t("searchPlaceholder")}
          filtersLabel={t("filters")}
        />

        {/* Stats Loading Skeleton */}
        <QuizStatsDisplaySkeleton />

        {/* Pagination Loading Skeleton */}
        <div className="flex items-center justify-center gap-2 pt-6">
          <Skeleton className="h-8 w-20" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8" />
            ))}
          </div>
          <Skeleton className="h-8 w-16" />
        </div>

        {/* Result summary skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Quiz Cards Loading skeletons */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="space-y-4 rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
            >
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      </WideContainer>
    );
  }

  // Error state
  if (isError) {
    return (
      <WideContainer classNames="flex-1 space-y-6 p-6">
        <div className="py-12 text-center">
          <h3 className="font-semibold text-destructive text-lg">
            Error loading quizzes
          </h3>
          <p className="mt-2 text-muted-foreground">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
          <Button onClick={() => refetch()} className="mt-4" variant="outline">
            Try Again
          </Button>
        </div>
      </WideContainer>
    );
  }

  const quizzes = quizListData?.content || [];
  const hasQuizzes = quizzes.length > 0;
  const totalPages = quizListData?.totalPages || 0;
  const totalElements = quizListData?.totalElements || 0;

  return (
    <WideContainer classNames="flex-1 space-y-6 p-6">
      {/* Search and Filters */}
      <QuizFilters
        onSearch={handleSearch}
        onFilter={handleFilter}
        searchPlaceholder={t("searchPlaceholder")}
        filtersLabel={t("filters")}
      />

      {/* Stats Summary */}
      {isStatsLoading ? (
        <QuizStatsDisplaySkeleton />
      ) : (
        stats && <QuizStatsDisplay stats={stats} />
      )}

      {/* Quizzes Grid */}
      {hasQuizzes ? (
        <>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0 || isFetching}
                variant="outline"
                size="sm"
                className="min-w-[70px]"
              >
                Previous
              </Button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber: number;
                  if (totalPages <= 5) {
                    pageNumber = i;
                  } else if (currentPage < 3) {
                    pageNumber = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNumber = totalPages - 5 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      variant={
                        currentPage === pageNumber ? "default" : "outline"
                      }
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={isFetching}
                    >
                      {pageNumber + 1}
                    </Button>
                  );
                })}
              </div>

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || isFetching}
                variant="outline"
                size="sm"
                className="min-w-[70px]"
              >
                Next
              </Button>
            </div>
          )}
          {/* Result summary */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Showing {quizzes.length} of {totalElements} quizzes
              {filters.search && ` for "${filters.search}"`}
            </p>
            <p className="text-muted-foreground text-sm">
              Page {currentPage + 1} of {totalPages}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isFetching && !isLoading
              ? // Show skeletons during pagination loading
                Array.from({ length: pageSize }).map((_, i) => (
                  <div
                    key={i}
                    className="space-y-4 rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
                  >
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                ))
              : quizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={convertToDisplayData(quiz)}
                    onDelete={handleQuizDelete}
                    onEdit={handleQuizEdit}
                    onView={handleQuizView}
                  />
                ))}
          </div>
        </>
      ) : (
        <EmptyState
          title={t("createCTA.title")}
          description={t("createCTA.description")}
          buttonText={t("createCTA.button")}
          createHref="quizzes/create"
        />
      )}
    </WideContainer>
  );
}
