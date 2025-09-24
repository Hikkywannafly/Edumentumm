"use client";

import { HtmlTitle } from "@/components/shared/editor/html-title";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import type { AttemptListItemDto } from "@/lib/api/quiz-attempt";
import type { BackendQuizEntity } from "@/types/quiz";
import { format } from "date-fns";
import { CheckCircle, Clock, SkipForward, Target, XCircle } from "lucide-react";
import ThinLayout from "../../layout/thin-layout";

interface AttemptHistoryProps {
  attempts: AttemptListItemDto[];
  quiz: BackendQuizEntity;
  onReviewAttempt: (attemptId: string) => void;
}

export function AttemptHistory({
  attempts,
  quiz,
  onReviewAttempt,
}: AttemptHistoryProps) {
  const sortedAttempts = [...attempts].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  return (
    <ThinLayout>
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-bold text-2xl tracking-tight">
              Attempt History
            </h1>
            <HtmlTitle
              content={`Review your previous quiz attempts for "${quiz.title}"`}
              as="p"
              className="text-muted-foreground"
            />
          </div>
          <Badge variant="secondary" className="self-start sm:self-auto">
            {attempts.length} {attempts.length === 1 ? "attempt" : "attempts"}
          </Badge>
        </div>
        <CardDescription className="mt-2">
          Track your progress and review past performances
        </CardDescription>
      </div>

      <div className="space-y-4">
        {sortedAttempts.map((attempt, index) => {
          const percentage = attempt.finalScorePercent;
          const isPassing = percentage >= (quiz.passingScore || 70);
          const totalQuestions =
            attempt.correct + attempt.wrong + attempt.skipped;

          return (
            <Card
              key={attempt.attemptId}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => onReviewAttempt(attempt.attemptId.toString())}
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold">
                      #{attempts.length - index}
                    </div>
                    <div>
                      <div className="font-medium">
                        {format(
                          new Date(attempt.completedAt),
                          "MMM d, yyyy 'at' h:mm a",
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Clock className="h-4 w-4" />
                        <span>
                          {Math.floor(attempt.timeSpentSec / 60)}m{" "}
                          {attempt.timeSpentSec % 60}s
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{attempt.correct}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{attempt.wrong}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <SkipForward className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{attempt.skipped}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold text-xl">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <Badge
                        variant={isPassing ? "default" : "destructive"}
                        className={`rounded-full px-3 py-1 font-medium text-sm ${isPassing ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"}`}
                      >
                        {isPassing ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Performance:</span>
                    <span
                      className={`font-medium ${
                        attempt.performance === "Excellent"
                          ? "text-green-600"
                          : attempt.performance === "Good"
                            ? "text-blue-600"
                            : attempt.performance === "Average"
                              ? "text-yellow-600"
                              : "text-red-600"
                      }`}
                    >
                      {attempt.performance}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <span>Score:</span>
                    <span className="font-medium">
                      {attempt.correct}/{totalQuestions}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ThinLayout>
  );
}
