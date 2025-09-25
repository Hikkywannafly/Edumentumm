"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import ThinLayout from "@/components/layout/thin-layout";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuizDetail } from "@/hooks/quiz/use-quiz-detail";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import type { QuizTakeMode } from "@/types/quiz-take";
import { extractIdFromSlug } from "@/utils/index";
import { ArrowLeft, Play } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import { HtmlTitle } from "@/components/shared/editor/html-title";

export default function QuizDetailPage() {
  const params = useParams();
  const { navigate } = useLocalizedNavigation();
  const [selectedMode, setSelectedMode] = useState<QuizTakeMode>("QUIZ");

  const slug = params.slug as string;
  const quizId = slug ? extractIdFromSlug(slug) : "0";

  const {
    data: quiz,
    isLoading,
    isError,
    error,
  } = useQuizDetail({
    id: quizId,
    enabled: !!quizId,
  });

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen w-full flex-col">
          <PageHeaderClient
            title=""
            action={
              <LocalizedLink href="quizzes">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Quizzes
                </Button>
              </LocalizedLink>
            }
            showThemeToggle={true}
            showLanguageSwitcher={true}
          />

          <ThinLayout classNames="flex flex-1 w-full items-center justify-center space-y-6 p-6">
            <div className="mx-auto max-w-2xl space-y-6 text-center">
              {/* Title Skeleton */}
              <div className="space-y-4">
                <Skeleton className="mx-auto h-9 w-3/4" />
                <Skeleton className="mx-auto h-6 w-full" />
              </div>

              {/* Quiz Stats Skeleton */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-card p-4">
                  <Skeleton className="mb-2 h-8 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="rounded-lg bg-card p-4">
                  <Skeleton className="mb-2 h-8 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="rounded-lg bg-card p-4">
                  <Skeleton className="mb-2 h-8 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="rounded-lg bg-card p-4">
                  <Skeleton className="mb-2 h-8 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>

              {/* Instructions Skeleton */}
              <div className="rounded-lg bg-muted/50 p-4">
                <Skeleton className="mb-2 h-5 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>

              {/* Mode Selection Skeleton */}
              <div className="space-y-4">
                <Skeleton className="mx-auto h-6 w-40" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-card p-4">
                    <div className="flex items-start space-x-3">
                      <Skeleton className="mt-1 h-4 w-4 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="mb-1 h-5 w-20" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-card p-4">
                    <div className="flex items-start space-x-3">
                      <Skeleton className="mt-1 h-4 w-4 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="mb-1 h-5 w-20" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Button Skeleton */}
              <Skeleton className="mx-auto h-12 w-40" />
            </div>
          </ThinLayout>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (isError || !quiz) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen flex-col">
          <PageHeaderClient
            title="Error"
            action={
              <LocalizedLink href="quizzes">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Quizzes
                </Button>
              </LocalizedLink>
            }
            showThemeToggle={true}
            showLanguageSwitcher={true}
          />
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="text-center">
              <h3 className="mb-2 font-semibold text-destructive text-lg">
                Quiz not found
              </h3>
              <p className="mb-4 text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "The quiz you're looking for doesn't exist."}
              </p>
              <LocalizedLink href="quizzes">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Quizzes
                </Button>
              </LocalizedLink>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleStartQuiz = () => {
    const slug = params.slug as string;
    navigate(`/quizzes/${slug}/take?mode=${selectedMode}`);
  };

  if (!quiz) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        <PageHeaderClient
          title=""
          action={
            <div className="flex gap-2">
              <LocalizedLink href="quizzes">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Quizzes
                </Button>
              </LocalizedLink>
            </div>
          }
          showThemeToggle={true}
          showLanguageSwitcher={true}
        />

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <div className="space-y-4">
              <HtmlTitle
                content={quiz.title}
                as="h1"
                className="font-bold text-3xl text-foreground"
              />
              {quiz.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {quiz.description}
                </p>
              )}
            </div>

            {/* Quiz Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card className="rounded-lg border bg-card p-4">
                <div className="font-semibold text-2xl text-foreground">
                  {quiz.totalQuestions}
                </div>
                <div className="text-muted-foreground text-sm">Questions</div>
              </Card>
              <Card className="rounded-lg bg-card p-4">
                <div className="font-semibold text-2xl text-foreground">
                  {quiz.estimatedTime}m
                </div>
                <div className="text-muted-foreground text-sm">Duration</div>
              </Card>
              <Card className="rounded-lg bg-card p-4">
                <div className="font-semibold text-2xl text-foreground">
                  {quiz.totalPoints}
                </div>
                <div className="text-muted-foreground text-sm">Points</div>
              </Card>
              <Card className="rounded-lg bg-card p-4">
                <div className="font-semibold text-2xl text-foreground">
                  {quiz.passingScore}%
                </div>
                <div className="text-muted-foreground text-sm">To Pass</div>
              </Card>
            </div>

            {/* Instructions */}
            {quiz.quizData?.instructions && (
              <div className="rounded-lg bg-muted/50 p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Instructions
                </h3>
                <p className="text-muted-foreground text-sm">
                  {quiz.quizData.instructions}
                </p>
              </div>
            )}

            {/* Mode Selection */}
            <div className="space-y-4">
              <h3 className="text-center font-medium text-foreground text-lg">
                Choose Quiz Mode
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Quiz Mode */}
                <Card
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMode === "QUIZ"
                      ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedMode("QUIZ")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`mt-1 h-4 w-4 flex-shrink-0 rounded-full border-2 ${
                          selectedMode === "QUIZ"
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedMode === "QUIZ" && (
                          <div
                            className="h-full w-full rounded-full bg-white"
                            style={{ transform: "scale(0.5)" }}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-1 font-semibold text-foreground">
                          Quiz Mode
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          You receive immediate feedback after each question.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Exam Mode */}
                <Card
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMode === "EXAM"
                      ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedMode("EXAM")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`mt-1 h-4 w-4 flex-shrink-0 rounded-full border-2 ${
                          selectedMode === "EXAM"
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedMode === "EXAM" && (
                          <div
                            className="h-full w-full rounded-full bg-white"
                            style={{ transform: "scale(0.5)" }}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-1 font-semibold text-foreground">
                          Exam Mode
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          All feedback is provided at the end of the quiz.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <Button
              size="lg"
              onClick={handleStartQuiz}
              className="px-8 py-3 text-lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Start {selectedMode === "QUIZ" ? "Quiz" : "Exam"}
            </Button>

            {quiz.maxAttempts > 1 && (
              <p className="text-muted-foreground text-sm">
                You have {quiz.maxAttempts} attempts for this quiz
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
