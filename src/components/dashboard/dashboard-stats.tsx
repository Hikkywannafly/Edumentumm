"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFlashcardTotalStats } from "@/hooks/flashcard/use-flashcard-total-stats";
import { useProfileStart } from "@/hooks/profile/use-profile-start";
import { useQuizStats } from "@/hooks/quiz/use-quiz-list";
import { BookOpen, Clock, Layers, Zap } from "lucide-react";
import { LocalizedLink } from "../localized-link";

interface UserLevel {
  level: number;
  currentXP: number;
  requiredXP: number;
}

interface DashboardStatsProps {
  userLevel?: UserLevel;
  stats?: {
    quizzes: number;
    flashcards: number;
    collections: number;
    studyStreak: number;
    longestStreak: number;
    studentsAhead: number;
  };
}

export default function DashboardStats({
  userLevel = { level: 1, currentXP: 35, requiredXP: 100 },
  stats = {
    quizzes: 6,
    flashcards: 3,
    collections: 2,
    studyStreak: 0,
    longestStreak: 3,
    studentsAhead: 0,
  },
}: DashboardStatsProps) {
  const { data: flashcardStats } = useFlashcardTotalStats();
  const { data: quizStats } = useQuizStats();
  const { info: profileInfo } = useProfileStart();

  // Extract level from profileInfo if available
  const currentLevel = profileInfo?.levelProgress
    ? Number.parseInt(profileInfo.levelProgress.replace("LEVEL_", "")) ||
      userLevel.level
    : userLevel.level;

  const progressPercentage = (userLevel.currentXP / userLevel.requiredXP) * 100;

  return (
    <div className="space-y-6">
      {/* Welcome Section with Level */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">
            Welcome back, {profileInfo?.username || "MerQyan"}!
          </h1>
          <p className="text-muted-foreground">
            Ready for another productive study session?
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium text-sm">Level {currentLevel}</p>
          <p className="text-muted-foreground text-xs">
            {userLevel.currentXP} / {userLevel.requiredXP} XP
          </p>
          <Progress value={progressPercentage} className="mt-1 w-32" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Quizzes Card */}
        <Card className="relative">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="font-medium text-muted-foreground text-sm">
                  Quizzes
                </p>
                <p className="font-bold text-3xl">
                  {(quizStats?.totalQuizzes || stats.quizzes).toString()}
                </p>
                <p className="text-muted-foreground text-sm">Created quizzes</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <Button
              variant="link"
              className="mt-4 h-auto p-0 text-blue-500"
              asChild
            >
              <LocalizedLink href="/quizzes/create">Create Quiz</LocalizedLink>
            </Button>
          </CardContent>
        </Card>

        {/* Flashcards Card */}
        <Card className="relative">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="font-medium text-muted-foreground text-sm">
                  Flashcards
                </p>
                <p className="font-bold text-3xl">
                  {(flashcardStats?.totalDecks || stats.flashcards).toString()}
                </p>
                <p className="text-muted-foreground text-sm">Flashcard sets</p>
              </div>
              <div className="rounded-lg bg-teal-50 p-3">
                <Layers className="h-5 w-5 text-teal-600" />
              </div>
            </div>
            <Button
              variant="link"
              className="mt-4 h-auto p-0 text-blue-500"
              asChild
            >
              <LocalizedLink href="/flashcards/create">
                Create Flashcards
              </LocalizedLink>
            </Button>
          </CardContent>
        </Card>

        {/* Study Sessions Card */}
        <Card className="relative">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="font-medium text-muted-foreground text-sm">
                  Set Up Study Sessions
                </p>
                <p className="text-muted-foreground text-sm">
                  Use the Pomodoro timer to maintain focus and track progress.
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <Button
              variant="link"
              className="mt-4 h-auto p-0 text-blue-500"
              asChild
            >
              <LocalizedLink href="/pomodoro">Start Timer</LocalizedLink>
            </Button>
          </CardContent>
        </Card>

        {/* Study Streak Card */}
        <Card className="relative">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="font-medium text-muted-foreground text-sm">
                  Study Streak
                </p>
                <p className="font-bold text-3xl">
                  {profileInfo?.streak || stats.studyStreak}
                </p>
                <div className="space-y-1 text-muted-foreground text-sm">
                  <p>days</p>
                  <p>
                    Longest: {profileInfo?.maxStreak || stats.longestStreak}{" "}
                    days
                  </p>
                  <p className="text-green-600">
                    Ahead of {stats.studentsAhead}% of students
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3">
                <Zap className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
