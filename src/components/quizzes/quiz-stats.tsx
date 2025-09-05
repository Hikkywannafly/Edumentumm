"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Target, Users } from "lucide-react";
import { useTranslations } from "next-intl";

interface QuizStatsData {
  totalQuizzes: number;
  publishedQuizzes: number;
  draftQuizzes: number;
  totalAttempts: number;
}

interface QuizStatsDisplayProps {
  stats: QuizStatsData;
}

export function QuizStatsDisplaySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={index}
          className="border border-border/50 bg-card/50 backdrop-blur-sm"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-1 h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function QuizStatsDisplay({ stats }: QuizStatsDisplayProps) {
  const t = useTranslations("Quizzes.stats");

  const statsCards = [
    {
      title: t("totalQuizzes"),
      value: stats.totalQuizzes,
      icon: BookOpen,
      description: `${stats.publishedQuizzes} published, ${stats.draftQuizzes} drafts`,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: t("totalAttempts"),
      value: stats.totalAttempts,
      icon: Users,
      description: "Total quiz attempts by users",
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Average Score",
      value: "N/A",
      icon: Target,
      description: "Coming soon",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Avg. Duration",
      value: "N/A",
      icon: Clock,
      description: "Coming soon",
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="border border-border/50 bg-card/50 backdrop-blur-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-muted-foreground text-sm">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString()
                  : stat.value}
              </div>
              <p className="mt-1 text-muted-foreground text-xs">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
