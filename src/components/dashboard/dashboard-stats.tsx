"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlashcardTotalStats } from "@/hooks/flashcard/use-flashcard-total-stats";
import { useProfileStart } from "@/hooks/profile/use-profile-start";
import { useQuizStats } from "@/hooks/quiz/use-quiz-list";
import { BookOpen, Clock, Layers, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocalizedLink } from "../localized-link";

export default function DashboardStats() {
  const t = useTranslations("Dashboard");

  const { data: flashcardStats, isLoading: flashcardLoading } =
    useFlashcardTotalStats();
  const { data: quizStats, isLoading: quizLoading } = useQuizStats();
  const { info: profileInfo, loading: profileLoading } = useProfileStart();

  // Extract level from profileInfo if available
  const currentLevel = profileInfo?.levelProgress
    ? Number.parseInt(profileInfo.levelProgress.replace("LEVEL_", "")) || 1
    : 1;

  // Mock level data for now (can be updated when real API is available)
  const userLevel = { level: currentLevel, currentXP: 35, requiredXP: 100 };
  const progressPercentage = (userLevel.currentXP / userLevel.requiredXP) * 100;

  return (
    <div className="space-y-6">
      {/* Welcome Section with Level */}
      <div className="flex items-center justify-between">
        <div>
          {profileLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>
          ) : (
            <div>
              <h1 className="font-bold text-2xl">
                {t("welcomeBack", {
                  username: profileInfo?.username || "User",
                })}
              </h1>
              <p className="text-muted-foreground">{t("readyForSession")}</p>
            </div>
          )}
        </div>
        <div className="text-right">
          {profileLoading ? (
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-1 h-2 w-32" />
            </div>
          ) : (
            <div>
              <p className="font-medium text-sm">
                {t("level", { level: currentLevel })}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("xpProgress", {
                  currentXP: userLevel.currentXP,
                  requiredXP: userLevel.requiredXP,
                })}
              </p>
              <Progress value={progressPercentage} className="mt-1 w-32" />
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Quizzes Card */}
        <Card className="relative">
          <CardContent className="p-6">
            {quizLoading ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="font-medium text-muted-foreground text-sm">
                      {t("quizzes")}
                    </p>
                    <p className="font-bold text-3xl">
                      {(quizStats?.totalQuizzes || 0).toString()}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {t("createdQuizzes")}
                    </p>
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
                  <LocalizedLink href="/quizzes/create">
                    {t("createQuiz")}
                  </LocalizedLink>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flashcards Card */}
        <Card className="relative">
          <CardContent className="p-6">
            {flashcardLoading ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-28" />
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="font-medium text-muted-foreground text-sm">
                      {t("flashcards")}
                    </p>
                    <p className="font-bold text-3xl">
                      {(flashcardStats?.totalDecks || 0).toString()}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {t("flashcardSets")}
                    </p>
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
                    {t("createQuiz")}
                  </LocalizedLink>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Sessions Card */}
        <Card className="relative">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="font-medium text-muted-foreground text-sm">
                  {t("setUpStudySessions")}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t("pomodoroDescription")}
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
              <LocalizedLink href="/pomodoro">{t("startTimer")}</LocalizedLink>
            </Button>
          </CardContent>
        </Card>

        {/* Study Streak Card */}
        <Card className="relative">
          <CardContent className="p-6">
            {profileLoading ? (
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="font-medium text-muted-foreground text-sm">
                    {t("studyStreak")}
                  </p>
                  <p className="font-bold text-3xl">
                    {profileInfo?.streak || 0}
                  </p>
                  <div className="space-y-1 text-muted-foreground text-sm">
                    <p>{t("days")}</p>
                    <p>
                      {t("longestStreak", {
                        maxStreak: profileInfo?.maxStreak || 0,
                      })}
                    </p>
                    <p className="text-green-600">{t("keepUpGreatWork")}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-yellow-50 p-3">
                  <Zap className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
