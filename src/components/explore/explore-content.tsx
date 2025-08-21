"use client";

import { usePublicFlashcards } from "@/hooks/use-public-flashcards";
import { useState } from "react";
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

  const { flashcardSets, pagination, isLoading, error, refetch } =
    usePublicFlashcards(activeTab === "flashcards" ? currentPage : 1, pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (activeTab === "flashcards") {
      refetch(page, pageSize);
    }
  };

  console.log("Explore Content Debug:", {
    activeTab,
    flashcardSets: flashcardSets.length,
    pagination,
    isLoading,
    error,
  });

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
        return (
          <Card className="flex items-center justify-center border-none py-12">
            <p className="text-muted-foreground">Loading flashcards...</p>
          </Card>
        );
      }

      if (error) {
        return (
          <Card className="flex items-center justify-center border-none py-12">
            <p className="text-red-500">Error loading flashcards: {error}</p>
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
      {renderContent()}
      <ExplorePaging
        pagination={pagination}
        onPageChange={handlePageChange}
        show={activeTab === "flashcards"}
      />
    </ThinLayout>
  );
}
