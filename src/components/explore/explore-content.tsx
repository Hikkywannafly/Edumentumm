"use client";

import { usePublicFlashcards } from "@/hooks/flashcard/use-flashcards-query";
import {
  usePublicQuizList,
  usePublicQuizTags,
} from "@/hooks/quiz/use-public-quizzes";
import { useDebounce } from "@/hooks/use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FlashcardSkeletonGrid } from "../flashcards/flashcard-skeleton";
import ThinLayout from "../layout/thin-layout";
import { Card } from "../ui";
import ExploreCard from "./explore-card";
import ExploreFilter from "./explore-filter";
import ExplorePaging from "./explore-paging";
import ExploreTitle from "./explore-title";
import FlashcardExploreCard from "./flashcard-explore-card";

export default function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get values from URL search params
  const urlTab = searchParams.get("tab") || "quizzes";
  const urlPage = Number(searchParams.get("page")) || 1;
  const urlSearchQuery = searchParams.get("search") || "";
  const urlTagIds = searchParams.get("tagIds") || "";

  // State management
  const [activeTab, setActiveTab] = useState(urlTab);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    urlTagIds ? urlTagIds.split(",").map(Number) : [],
  );
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const pageSize = 6;

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Convert UI page (1-based) to API page (0-based)
  const apiPage = currentPage - 1;

  // Update search params in URL
  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }

      // Reset to page 1 when search or filter changes
      if ("search" in updates || "tagIds" in updates || "tab" in updates) {
        newSearchParams.set("page", "1");
      }

      const newUrl = `${pathname}?${newSearchParams.toString()}`;
      router.push(newUrl, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== urlSearchQuery) {
      updateSearchParams({ search: debouncedSearch });
    }
  }, [debouncedSearch, urlSearchQuery, updateSearchParams]);

  // Sync state with URL on mount and when URL changes
  useEffect(() => {
    setActiveTab(urlTab);
    setCurrentPage(urlPage);
    setSearchQuery(urlSearchQuery);
    setSelectedTagIds(urlTagIds ? urlTagIds.split(",").map(Number) : []);
  }, [urlTab, urlPage, urlSearchQuery, urlTagIds]);

  // Fetch public quizzes
  const {
    data: quizzesResponse,
    isLoading: quizzesLoading,
    error: quizzesError,
    refetch: refetchQuizzes,
  } = usePublicQuizList(
    activeTab === "quizzes"
      ? {
          page: apiPage,
          size: pageSize,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(selectedTagIds.length > 0 && {
            tagIds: selectedTagIds.join(","),
          }),
        }
      : undefined,
  );

  // Fetch public flashcards
  const {
    data: flashcardsResponse,
    isLoading: flashcardsLoading,
    error: flashcardsError,
    refetch: refetchFlashcards,
  } = usePublicFlashcards(activeTab === "flashcards" ? apiPage : 0, pageSize);

  // Fetch all tags for filtering
  const { data: tagsData, isLoading: tagsLoading } = usePublicQuizTags();

  // Extract data with fallbacks
  const quizSets = quizzesResponse?.content || [];
  const flashcardSets = flashcardsResponse?.data || [];

  const quizzesPagination = quizzesResponse
    ? {
        currentPage: quizzesResponse.number + 1,
        pageSize: quizzesResponse.size,
        totalElements: quizzesResponse.totalElements,
        totalPages: quizzesResponse.totalPages,
        hasNext: !quizzesResponse.last,
        hasPrevious: !quizzesResponse.first,
      }
    : {
        currentPage: 1,
        pageSize,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };

  // Pagination data for flashcards
  const flashcardsPagination = flashcardsResponse?.pagination
    ? {
        currentPage: flashcardsResponse.pagination.currentPage + 1,
        pageSize: flashcardsResponse.pagination.pageSize,
        totalElements: flashcardsResponse.pagination.totalElements,
        totalPages: flashcardsResponse.pagination.totalPages,
        hasNext: flashcardsResponse.pagination.hasNext,
        hasPrevious: flashcardsResponse.pagination.hasPrevious,
      }
    : {
        currentPage: 1,
        pageSize,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      updateSearchParams({ page: page.toString() });
    },
    [updateSearchParams],
  );

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      setCurrentPage(1);
      updateSearchParams({ tab, page: "1" });
    },
    [updateSearchParams],
  );

  const handleTagFilterChange = useCallback(
    (tagIds: number[]) => {
      setSelectedTagIds(tagIds);
      setCurrentPage(1);
      updateSearchParams({
        tagIds: tagIds.length > 0 ? tagIds.join(",") : null,
        page: "1",
      });
    },
    [updateSearchParams],
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  useEffect(() => {
    if (activeTab === "quizzes") {
      refetchQuizzes();
    } else {
      refetchFlashcards();
    }
  }, [activeTab, refetchQuizzes, refetchFlashcards]);

  const isLoading =
    activeTab === "quizzes" ? quizzesLoading : flashcardsLoading;
  const error = activeTab === "quizzes" ? quizzesError : flashcardsError;
  const pagination =
    activeTab === "quizzes" ? quizzesPagination : flashcardsPagination;

  const renderContent = () => {
    if (activeTab === "flashcards") {
      if (isLoading) {
        return <FlashcardSkeletonGrid count={6} />;
      }

      if (error) {
        return (
          <Card className="flex items-center justify-center border-none py-12">
            <p className="text-red-500">
              Error loading flashcards: {error?.message}
            </p>
          </Card>
        );
      }

      if (flashcardSets.length === 0) {
        return (
          <Card className="flex items-center justify-center border-none py-12">
            <p className="text-muted-foreground">No public flashcards found</p>
          </Card>
        );
      }

      return (
        <Card className="grid gap-4 border-none py-6 md:grid-cols-3">
          {flashcardSets.map((flashcardSet) => (
            <FlashcardExploreCard
              key={flashcardSet.id}
              flashcardSet={flashcardSet}
            />
          ))}
        </Card>
      );
    }

    // Render quizzes (default tab)
    if (isLoading) {
      return <FlashcardSkeletonGrid count={6} />;
    }

    if (error) {
      return (
        <Card className="flex items-center justify-center border-none py-12">
          <p className="text-red-500">
            Error loading quizzes: {error?.message}
          </p>
        </Card>
      );
    }

    if (quizSets.length === 0) {
      return (
        <Card className="flex items-center justify-center border-none py-12">
          <p className="text-muted-foreground">No public quizzes found</p>
        </Card>
      );
    }

    return (
      <Card className="grid gap-4 border-none py-6 md:grid-cols-3">
        {quizSets.map((quiz) => (
          <ExploreCard
            key={quiz.id}
            id={quiz.id}
            slug={quiz.slug}
            title={quiz.title}
            questions={quiz.totalQuestions || 0}
            daysAgo={Math.floor(
              (Date.now() - new Date(quiz.createdAt).getTime()) /
                (1000 * 60 * 60 * 24),
            )}
          />
        ))}
      </Card>
    );
  };

  return (
    <ThinLayout>
      <ExploreTitle />
      <ExploreFilter
        tab={activeTab}
        onTabChange={handleTabChange}
        tags={tagsData || []}
        selectedTagIds={selectedTagIds}
        onTagFilterChange={handleTagFilterChange}
        tagsLoading={tagsLoading}
        onSearchChange={handleSearchChange}
        searchQuery={searchQuery}
      />
      <ExplorePaging
        pagination={pagination}
        onPageChange={handlePageChange}
        show={true}
      />
      {renderContent()}
    </ThinLayout>
  );
}
