"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { LocalizedLink } from "@/components/localized-link";
import { QuizTakeContent } from "@/components/quizzes/take";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuizDetail } from "@/hooks/quiz/use-quiz-detail";
import { extractIdFromSlug } from "@/utils/index";
import { ArrowLeft, Play } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
export default function QuizDetailPage() {
  const params = useParams();
  const [isStarted, setIsStarted] = useState(false);

  // Extract quiz ID from slug (format: "title-id")
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
        <div className="flex min-h-screen flex-col">
          <PageHeaderClient
            title="Loading..."
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
          <div className="flex-1 space-y-6 p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
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

  // Quiz started - show quiz taking interface
  if (isStarted && quiz) {
    return (
      <DashboardLayout>
        <QuizTakeContent quiz={quiz} />
      </DashboardLayout>
    );
  }

  // If quiz is not loaded yet, this shouldn't happen after loading check
  if (!quiz) {
    return null;
  }

  // Quiz preview/start screen
  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        <PageHeaderClient
          title={quiz.title}
          action={
            <div className="flex gap-2">
              <LocalizedLink href="quizzes">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Quizzes
                </Button>
              </LocalizedLink>
              {quiz.status === "DRAFT" && (
                <LocalizedLink href={`quizzes/${quiz.slug}-${quiz.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit Quiz
                  </Button>
                </LocalizedLink>
              )}
            </div>
          }
          showThemeToggle={true}
          showLanguageSwitcher={true}
        />

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <div className="space-y-4">
              <h1 className="font-bold text-3xl text-foreground">
                {quiz.title}
              </h1>
              {quiz.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {quiz.description}
                </p>
              )}
            </div>

            {/* Quiz Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="font-semibold text-2xl text-foreground">
                  {quiz.totalQuestions}
                </div>
                <div className="text-muted-foreground text-sm">Questions</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="font-semibold text-2xl text-foreground">
                  {quiz.estimatedTime}m
                </div>
                <div className="text-muted-foreground text-sm">Duration</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="font-semibold text-2xl text-foreground">
                  {quiz.totalPoints}
                </div>
                <div className="text-muted-foreground text-sm">Points</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="font-semibold text-2xl text-foreground">
                  {quiz.passingScore}%
                </div>
                <div className="text-muted-foreground text-sm">To Pass</div>
              </div>
            </div>

            {/* Instructions */}
            {quiz.quizData?.instructions && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Instructions
                </h3>
                <p className="text-muted-foreground text-sm">
                  {quiz.quizData.instructions}
                </p>
              </div>
            )}

            {/* Start Button */}
            <Button
              size="lg"
              onClick={() => setIsStarted(true)}
              className="bg-blue-600 px-8 py-3 text-lg text-white hover:bg-blue-700"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Quiz
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
