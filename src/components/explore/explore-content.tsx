"use client";

import { usePublicFlashcards } from "@/hooks/flashcard/use-flashcards-query";
import {
  usePublicQuizList,
  usePublicQuizTags,
} from "@/hooks/quiz/use-public-quizzes";
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
  const [activeTab, setActiveTab] = useState("quizzes");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6;

  // Convert UI page (1-based) to API page (0-based)
  const apiPage = currentPage - 1;

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
          ...(searchQuery && { search: searchQuery }),
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

  // Pagination data for quizzes
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

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleTagFilterChange = useCallback((tagIds: number[]) => {
    setSelectedTagIds(tagIds);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  }, []);

  // Refetch data when filters change
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
        onTabChange={setActiveTab}
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
