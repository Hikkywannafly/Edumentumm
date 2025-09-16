"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { BackendQuizEntity } from "@/types/quiz";
import type { QuizResult } from "@/types/quiz-take";
import { BrainCircuit, CheckCircle, CircleX } from "lucide-react";

interface PassFailStatusProps {
  result: QuizResult;
  quiz: BackendQuizEntity;
}

export function PassFailStatus({ result, quiz }: PassFailStatusProps) {
  const passed = result.percentage >= (quiz.passingScore || 70);

  return (
    <Card className="rounded-xl bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${passed ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
            >
              {passed ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <CircleX className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div>
              <p
                className={`font-bold text-lg ${passed ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
              >
                {passed
                  ? "Congratulations! You passed!"
                  : "You didn't pass this time"}
              </p>
              <p className="text-muted-foreground text-sm">
                {passed
                  ? `You scored above the passing score of ${quiz.passingScore || 70}%`
                  : `You need ${quiz.passingScore || 70}% to pass. Keep studying and try again!`}
              </p>
            </div>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${passed ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
          >
            <BrainCircuit
              className={`h-6 w-6 ${passed ? "text-green-600" : "text-red-600"}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
