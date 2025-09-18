"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import ThinLayout from "@/components/layout/thin-layout";
import { QuizTakeContent } from "@/components/quizzes/take";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuizDetail } from "@/hooks/quiz/use-quiz-detail";
import type { QuizTakeMode } from "@/types/quiz-take";
import { extractIdFromSlug } from "@/utils/index";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function QuizTakePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = params.slug as string;
  const quizId = slug ? extractIdFromSlug(slug) : "0";
  const mode = (searchParams.get("mode") as QuizTakeMode) || "QUIZ";

  const {
    data: quiz,
    isLoading,
    isError,
    error,
  } = useQuizDetail({
    id: quizId,
    enabled: !!quizId,
  });

  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen flex-col">
          <PageHeaderClient
            title="Loading..."
            action={
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
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
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            }
            showThemeToggle={true}
            showLanguageSwitcher={true}
          />
          <ThinLayout classNames="flex flex-1 items-center justify-center p-6">
            <div className="text-center">
              <h3 className="mb-2 font-semibold text-destructive text-lg">
                Quiz not found
              </h3>
              <p className="mb-4 text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "The quiz you're looking for doesn't exist."}
              </p>
              <Button onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </ThinLayout>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        <PageHeaderClient
          title=""
          action={
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          }
          showThemeToggle={true}
          showLanguageSwitcher={true}
        />
        <div className="flex-1">
          <QuizTakeContent quiz={quiz} mode={mode} />
        </div>
      </div>
    </DashboardLayout>
  );
}
