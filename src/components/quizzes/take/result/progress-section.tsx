"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { QuizResult } from "@/types/quiz-take";

interface ProgressSectionProps {
  result: QuizResult;
}

export function ProgressSection({ result }: ProgressSectionProps) {
  return (
    <Card className="rounded-xl bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-medium text-sm">Overall Progress</span>
          <span className="font-bold text-sm">
            {result.percentage.toFixed(1)}%
          </span>
        </div>
        <Progress value={result.percentage} className="h-3" />
      </CardContent>
    </Card>
  );
}
