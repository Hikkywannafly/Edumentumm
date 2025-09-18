"use client";

import { usePublicFlashcardDetailsPrefetch } from "@/hooks/flashcard/use-flashcard-prefecth";
import { usePublicFlashcards } from "@/hooks/flashcard/use-flashcards-query";
import { useState } from "react";
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
  const pageSize = 6;

  // Convert UI page (1-based) to API page (0-based)
  const apiPage = currentPage - 1;

  const {
    data: flashcardsResponse,
    isLoading,
    error,
  } = usePublicFlashcards(activeTab === "flashcards" ? apiPage : 0, pageSize);

  usePublicFlashcardDetailsPrefetch({
    enabled: activeTab === "flashcards",
    prefetchOnPageLoad: true,
    prefetchDelay: 500,
    batchSize: 3,
    page: activeTab === "flashcards" ? apiPage : 0,
    size: pageSize,
  });

  // Extract data with fallbacks
  const flashcardSets = flashcardsResponse?.data || [];
  const apiPagination = flashcardsResponse?.pagination;

  // Convert API pagination (0-based) to UI pagination (1-based)
  const pagination = apiPagination
    ? {
        currentPage: apiPagination.currentPage + 1,
        pageSize: apiPagination.pageSize,
        totalElements: apiPagination.totalElements,
        totalPages: apiPagination.totalPages,
        hasNext: apiPagination.hasNext,
        hasPrevious: apiPagination.hasPrevious,
      }
    : {
        currentPage: 1,
        pageSize: pageSize,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (activeTab === "flashcards") {
      // React Query will automatically refetch when dependencies change
      // No need to manually call refetch with parameters
    }
  };

  const mockQuizData = [
    { title: "Debt Instruments and Valuation Quiz", questions: 10, daysAgo: 9 },
    {
      title: "Trắc nghiệm Triết học Mác-Lênin (Chương 1)",
      questions: 19,
      daysAgo: 11,
    },
    {
      title: "Trắc nghiệm Triết học Mác-Lênin cơ bản",
      questions: 5,
      daysAgo: 11,
    },
    { title: "Project Management Fundamentals", questions: 19, daysAgo: 17 },
    { title: "Câu hỏi về Triết học Mác", questions: 10, daysAgo: 18 },
    { title: "Triết học Mác - Lênin", questions: 9, daysAgo: 20 },
  ];

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
    return (
      <Card className="grid gap-4 border-none py-6 md:grid-cols-3">
        {mockQuizData.map((item, idx) => (
          <ExploreCard key={idx} {...item} />
        ))}
      </Card>
    );
  };

  return (
    <ThinLayout>
      <ExploreTitle />
      <ExploreFilter tab={activeTab} onTabChange={setActiveTab} />
      <ExplorePaging
        pagination={pagination}
        onPageChange={handlePageChange}
        show={activeTab === "flashcards"}
      />
      {renderContent()}
    </ThinLayout>
  );
}
