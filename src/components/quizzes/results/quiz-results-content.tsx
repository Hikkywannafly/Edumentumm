"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuizAttempts } from "@/hooks/quiz/use-quiz-attempts";
import { useQuizDetail } from "@/hooks/quiz/use-quiz-detail";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { extractIdFromSlug } from "@/utils/index";
import { ArrowLeft, Trophy } from "lucide-react";
import { useParams } from "next/navigation";
import { AttemptHistory } from "./attempt-history";

export function QuizResultsContent() {
  const params = useParams();
  const { navigate, goBack } = useLocalizedNavigation();

  const slug = params.slug as string;
  const quizId = slug ? extractIdFromSlug(slug) : "0";

  const {
    data: quiz,
    isLoading: isQuizLoading,
    isError: isQuizError,
    error: quizError,
  } = useQuizDetail({
    id: quizId,
    enabled: !!quizId,
  });

  const {
    data: attempts,
    isLoading: isAttemptsLoading,
    isError: isAttemptsError,
    error: attemptsError,
  } = useQuizAttempts({
    quizId,
    enabled: !!quizId,
  });

  const handleBack = () => {
    goBack();
  };

  // Loading state
  if (isQuizLoading || isAttemptsLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 space-y-6 p-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isQuizError || isAttemptsError || !quiz) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 p-6">
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <h3 className="mb-2 font-semibold text-destructive text-lg">
                Error loading results
              </h3>
              <p className="mb-4 text-muted-foreground">
                {quizError instanceof Error
                  ? quizError.message
                  : attemptsError &&
                      typeof attemptsError === "object" &&
                      "message" in attemptsError
                    ? attemptsError.message
                    : "Failed to load quiz results."}
              </p>
              <Button onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main results interface
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <div className="mb-8 rounded-xl bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-bold text-2xl">Quiz Results</h1>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <span>{attempts?.length || 0} attempts</span>
              </div>
            </div>
          </div>

          {attempts && attempts.length > 0 ? (
            <>
              <AttemptHistory
                attempts={attempts}
                quiz={quiz}
                onReviewAttempt={(attemptId: string) => {
                  // Navigate to detailed review page with locale support
                  navigate(`/quizzes/${slug}/results/${attemptId}`);
                }}
              />
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => navigate(`/quizzes/${slug}/take`)}
                  className="w-full sm:w-auto"
                >
                  Retake Quiz
                </Button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-lg">No attempts yet</h3>
              <p className="mb-4 text-muted-foreground">
                You haven't taken this quiz yet. Start now to see your results!
              </p>
              <Button onClick={() => navigate(`/quizzes/${slug}/take`)}>
                Take Quiz
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
