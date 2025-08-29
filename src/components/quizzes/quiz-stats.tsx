"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { QuizStatsData } from "@/types/quiz-display";

interface QuizStatsProps {
  stats: QuizStatsData;
}

export function QuizStats({ stats }: QuizStatsProps) {
  const statItems = [
    {
      label: "Total Quizzes",
      value: stats.totalQuizzes,
    },
    {
      label: "Published",
      value: stats.publishedQuizzes,
    },
    {
      label: "Drafts",
      value: stats.draftQuizzes,
    },
    {
      label: "Total Attempts",
      value: stats.totalAttempts,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="font-bold text-2xl">{item.value}</div>
            <p className="text-muted-foreground text-xs">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
