"use client";

import { useFlashcardPrefetch } from "@/hooks/flashcard/use-flashcard-prefecth";
import { useKanbanPrefetch } from "@/hooks/kanban/use-kanban-query";
import { useQuizPrefetch } from "@/hooks/quiz/use-quiz-prefetch";
import { useEffect } from "react";
import DashboardStats from "./dashboard-stats";
import KanbanBoard from "./kanban-board";
import RecentNotes from "./recent-notes";
import StudyGroupsActivity from "./study-groups-activity";
import StudyTime from "./study-time";

export default function DashboardContent() {
  // Prefetch hooks
  useQuizPrefetch();
  useFlashcardPrefetch();

  const { prefetchEssentialData } = useKanbanPrefetch();

  // Prefetch kanban data when dashboard loads
  useEffect(() => {
    prefetchEssentialData();
  }, [prefetchEssentialData]);

  return (
    <div className="container mx-auto space-y-6 p-6">
      <DashboardStats />
      <StudyGroupsActivity />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <KanbanBoard />
        </div>
        <div className="space-y-6">
          <StudyTime />
          <RecentNotes />
        </div>
      </div>
    </div>
  );
}
