"use client";

import { useFlashcardPrefetch } from "@/hooks/flashcard/use-flashcard-prefecth";
import { useQuizPrefetch } from "@/hooks/quiz/use-quiz-prefetch";
import DashboardStats from "./dashboard-stats";
import KanbanBoard from "./kanban-board";
import RecentNotes from "./recent-notes";
import StudyGroupsActivity from "./study-groups-activity";
import StudyTime from "./study-time";

export default function DashboardContent() {
  // Prefetch quiz data when dashboard loads
  useQuizPrefetch();

  // Prefetch flashcard data when dashboard loads
  useFlashcardPrefetch();

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Study Groups Activity */}
      <StudyGroupsActivity />

      {/* Bottom Section with 3 columns layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kanban Board - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <KanbanBoard />
        </div>

        {/* Right Column - 1/3 width with vertical stack */}
        <div className="space-y-6">
          {/* Study Time */}
          <StudyTime />

          {/* Recent Notes */}
          <RecentNotes />
        </div>
      </div>
    </div>
  );
}
