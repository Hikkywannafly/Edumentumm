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
import TopicExploration from "./topic-exploration";

export default function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlTab = searchParams.get("tab") || "quizzes";
  const urlPage = Number(searchParams.get("page")) || 1;
  const urlSearchQuery = searchParams.get("search") || "";
  const urlTagIds = searchParams.get("tagIds") || "";
  const urlSortBy = searchParams.get("sortBy") || "newest";
  const urlViewMode = searchParams.get("view") || "discovery";

  const [activeTab, setActiveTab] = useState(urlTab);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    urlTagIds ? urlTagIds.split(",").map(Number) : [],
  );
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [sortBy, setSortBy] = useState(urlSortBy);
  const [viewMode, setViewMode] = useState(urlViewMode);
  const pageSize = 6;

  const debouncedSearch = useDebounce(searchQuery, 500);

  const apiPage = currentPage - 1;

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

      if (
        "search" in updates ||
        "tagIds" in updates ||
        "tab" in updates ||
        "sortBy" in updates ||
        "view" in updates
      ) {
        newSearchParams.set("page", "1");
      }

      const newUrl = `${pathname}?${newSearchParams.toString()}`;
      router.push(newUrl, { scroll: false });
    },
    [searchParams, pathname, router],
  );

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
    setSortBy(urlSortBy);
    setViewMode(urlViewMode);
  }, [urlTab, urlPage, urlSearchQuery, urlTagIds, urlSortBy, urlViewMode]);

  // Map frontend sort options to backend parameters
  const getSortParams = (): {
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    popularityCriteria?: string;
  } => {
    switch (sortBy) {
      case "newest":
        return { sortBy: "createdAt", sortDirection: "desc" };
      case "oldest":
        return { sortBy: "createdAt", sortDirection: "asc" };
      case "title-a-z":
        return { sortBy: "title", sortDirection: "asc" };
      case "title-z-a":
        return { sortBy: "title", sortDirection: "desc" };
      case "popular-attempts":
        return { popularityCriteria: "attemptCount" };
      case "popular-views":
        return { popularityCriteria: "viewCount" };
      case "popular-completions":
        return { popularityCriteria: "completionCount" };
      default:
        return { sortBy: "createdAt", sortDirection: "desc" };
    }
  };

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
          ...getSortParams(),
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

  const handleSortChange = useCallback(
    (sortValue: string) => {
      setSortBy(sortValue);
      setCurrentPage(1);
      updateSearchParams({ sortBy: sortValue, page: "1" });
    },
    [updateSearchParams],
  );

  const handleViewModeChange = useCallback(
    (mode: string) => {
      setViewMode(mode);
      updateSearchParams({ view: mode });
    },
    [updateSearchParams],
  );

  const handleTopicSelect = useCallback(
    (tagId: number) => {
      // Toggle tag selection
      const newSelectedTagIds = selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId];

      setSelectedTagIds(newSelectedTagIds);
      setCurrentPage(1);
      updateSearchParams({
        tagIds:
          newSelectedTagIds.length > 0 ? newSelectedTagIds.join(",") : null,
        page: "1",
        view: "list", // Switch to list view when a topic is selected
      });
    },
    [selectedTagIds, updateSearchParams],
  );

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

    // Render quizzes
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

    // Show topic exploration view when no search/filter and in discovery mode
    const showTopicExploration =
      viewMode === "discovery" &&
      !debouncedSearch &&
      selectedTagIds.length === 0;

    if (showTopicExploration && tagsData && tagsData.length > 0) {
      return (
        <div className="py-6">
          <TopicExploration
            tags={tagsData}
            onTopicSelect={handleTopicSelect}
            selectedTagId={selectedTagIds[0]} // Show first selected tag as active
          />
        </div>
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
            attemptCount={quiz.totalAttempts || 0}
            viewCount={quiz.viewCount || 0}
            completionCount={quiz.completionCount || 0}
            // Pass user information if available
            user={quiz.user}
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
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onViewModeChange={handleViewModeChange}
        viewMode={viewMode}
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
