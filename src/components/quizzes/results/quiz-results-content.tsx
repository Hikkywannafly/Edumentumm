"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuizAttempts } from "@/hooks/quiz/use-quiz-attempts";
import { useQuizDetail } from "@/hooks/quiz/use-quiz-detail";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { extractIdFromSlug } from "@/utils/index";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  Clock,
  Target,
  Timer,
  Trophy,
  User,
} from "lucide-react";
import { useParams } from "next/navigation";
import ThinLayout from "../../layout/thin-layout";
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
          <Card>
            <CardContent className="flex min-h-[400px] items-center justify-center p-6">
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
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main results interface
  return (
    <ThinLayout classNames="flex min-h-screen flex-col">
      <div className="flex-1">
        <Card className="mb-8 rounded-xl border-0">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                <CardDescription className="max-w-2xl">
                  {quiz.description || "No description available"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{attempts?.length || 0} attempts</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Quiz Info */}
            <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-border/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground text-sm">Questions</span>
                <span className="font-medium">{quiz.totalQuestions}</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground text-sm">Time</span>
                <span className="font-medium">{quiz.estimatedTime} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground text-sm">
                  Passing Score
                </span>
                <span className="font-medium">{quiz.passingScore}%</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-purple-500" />
                <span className="text-muted-foreground text-sm">
                  Created by
                </span>
                <span className="font-medium">
                  {quiz.user?.username || "Unknown"}
                </span>
              </div>
            </div>

            {/* Summary Stats */}
            {attempts && attempts.length > 0 && (
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Award className="h-4 w-4 text-blue-500" />
                      <span>Average Score</span>
                    </div>
                    <div className="mt-1 font-bold text-xl">
                      {(
                        attempts.reduce(
                          (sum, attempt) => sum + attempt.finalScorePercent,
                          0,
                        ) / attempts.length
                      ).toFixed(1)}
                      %
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Target className="h-4 w-4 text-green-500" />
                      <span>Best Score</span>
                    </div>
                    <div className="mt-1 font-bold text-xl">
                      {Math.max(
                        ...attempts.map((a) => a.finalScorePercent),
                      ).toFixed(1)}
                      %
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4 text-amber-500" />
                      <span>Last Attempt</span>
                    </div>
                    <div className="mt-1 font-bold text-xl">
                      {new Date(
                        attempts.reduce(
                          (latest, attempt) =>
                            new Date(attempt.completedAt) >
                            new Date(latest.completedAt)
                              ? attempt
                              : latest,
                          attempts[0],
                        ).completedAt,
                      ).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span>Avg Time</span>
                    </div>
                    <div className="mt-1 font-bold text-xl">
                      {Math.floor(
                        attempts.reduce(
                          (sum, attempt) => sum + attempt.timeSpentSec,
                          0,
                        ) /
                          attempts.length /
                          60,
                      )}
                      m{" "}
                      {Math.round(
                        (attempts.reduce(
                          (sum, attempt) => sum + attempt.timeSpentSec,
                          0,
                        ) /
                          attempts.length) %
                          60,
                      )}
                      s
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

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
                  You haven't taken this quiz yet. Start now to see your
                  results!
                </p>
                <Button onClick={() => navigate(`/quizzes/${slug}/take`)}>
                  Take Quiz
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ThinLayout>
  );
}
