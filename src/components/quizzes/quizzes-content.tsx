"use client";

import type { QuizDisplayData } from "@/types/quiz-display";
import { useTranslations } from "next-intl";
import ThinLayout from "../layout/thin-layout";
import { EmptyState } from "./empty-state";
import { QuizCard } from "./quiz-card";
import { QuizFilters } from "./quiz-filters";

// Mock data - Replace with real data from React Query hooks
const mockQuizzes: QuizDisplayData[] = [
  {
    id: 1,
    title: "Introduction to React",
    description:
      "Learn the basics of React including components, state, and props",
    slug: "introduction-to-react-1",
    difficulty: "EASY",
    totalQuestions: 10,
    estimatedTime: 15,
    status: "PUBLISHED",
    visibility: "PUBLIC",
    tags: ["React", "JavaScript", "Frontend"],
    createdAt: "2024-01-15",
    viewCount: 245,
    attemptCount: 89,
  },
  {
    id: 2,
    title: "Advanced TypeScript",
    description:
      "Deep dive into TypeScript generics, utility types, and advanced patterns",
    slug: "advanced-typescript-2",
    difficulty: "HARD",
    totalQuestions: 15,
    estimatedTime: 25,
    status: "DRAFT",
    visibility: "PRIVATE",
    tags: ["TypeScript", "JavaScript", "Advanced"],
    createdAt: "2024-01-20",
    viewCount: 0,
    attemptCount: 0,
  },
  {
    id: 3,
    title: "CSS Flexbox & Grid",
    description: "Master modern CSS layout techniques with practical examples",
    slug: "css-flexbox-grid-3",
    difficulty: "MEDIUM",
    totalQuestions: 12,
    estimatedTime: 20,
    status: "PUBLISHED",
    visibility: "PUBLIC",
    tags: ["CSS", "Layout", "Design"],
    createdAt: "2024-01-18",
    viewCount: 156,
    attemptCount: 67,
  },
];

// Helper functions for data processing
// const calculateStats = (quizzes: QuizDisplayData[]): QuizStatsData => {
//   return {
//     totalQuizzes: quizzes.length,
//     publishedQuizzes: quizzes.filter(q => q.status === 'PUBLISHED').length,
//     draftQuizzes: quizzes.filter(q => q.status === 'DRAFT').length,
//     totalAttempts: quizzes.reduce((sum, q) => sum + q.attemptCount, 0),
//   };
// };

export function QuizzesContent() {
  const t = useTranslations("Quizzes");

  // TODO: Replace with real data from React Query hooks
  const quizzes = mockQuizzes;
  const hasQuizzes = quizzes.length > 0;

  // Event handlers - TODO: Implement with real functionality
  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    // TODO: Implement search functionality
  };

  const handleFilter = () => {
    console.log("Filter clicked");
    // TODO: Implement filter functionality
  };

  const handleQuizDelete = (id: number) => {
    console.log("Delete quiz:", id);
    // TODO: Implement delete functionality
  };

  const handleQuizEdit = (quiz: QuizDisplayData) => {
    console.log("Edit quiz:", quiz);
    // TODO: Implement edit functionality
  };

  const handleQuizView = (quiz: QuizDisplayData) => {
    console.log("View quiz:", quiz);
    // TODO: Implement view functionality
  };

  return (
    <ThinLayout classNames="flex-1 space-y-6 p-6 ">
      {/* Search and Filters */}
      <QuizFilters
        onSearch={handleSearch}
        onFilter={handleFilter}
        searchPlaceholder={t("searchPlaceholder")}
        filtersLabel={t("filters")}
      />

      {/* Stats Summary
      {hasQuizzes && <QuizStats stats={stats} />} */}

      {/* Quizzes Grid */}
      {hasQuizzes ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onDelete={handleQuizDelete}
              onEdit={handleQuizEdit}
              onView={handleQuizView}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={t("createCTA.title")}
          description={t("createCTA.description")}
          buttonText={t("createCTA.button")}
          createHref="quizzes/create"
        />
      )}
    </ThinLayout>
  );
}
