"use client";

import { Badge } from "@/components/ui/badge";
import type { AttemptListItemDto } from "@/lib/api/quiz-attempt";
import type { BackendQuizEntity } from "@/types/quiz";
import { format } from "date-fns";
import { Clock } from "lucide-react";

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
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-semibold text-lg">Attempt History</h3>
        <div className="space-y-3">
          {sortedAttempts.map((attempt, index) => {
            const percentage = attempt.finalScorePercent;
            const isPassing = percentage >= (quiz.passingScore || 70);

            return (
              <div
                key={attempt.attemptId}
                className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                onClick={() => onReviewAttempt(attempt.attemptId.toString())}
              >
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-muted-foreground">
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
                  <div className="text-right">
                    <div className="font-semibold">
                      {attempt.correct}/
                      {attempt.correct + attempt.wrong + attempt.skipped}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>

                  <Badge variant={isPassing ? "default" : "destructive"}>
                    {isPassing ? "Passed" : "Failed"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
