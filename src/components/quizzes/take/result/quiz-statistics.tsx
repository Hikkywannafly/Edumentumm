"use client";

import { Card } from "@/components/ui/card";
import type { QuizResult } from "@/types/quiz-take";
import { BrainCircuit, ChartColumn, CheckCircle, Timer } from "lucide-react";

interface QuizStatisticsProps {
  result: QuizResult;
}

export function QuizStatistics({ result }: QuizStatisticsProps) {
  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return "Expert";
    if (percentage >= 75) return "Advanced";
    if (percentage >= 60) return "Intermediate";
    if (percentage >= 40) return "Beginner";
    return "Novice";
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90)
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (percentage >= 75)
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    if (percentage >= 60)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    if (percentage >= 40)
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="col-span-1 flex flex-col items-center rounded-lg bg-yellow-100 p-4 dark:bg-yellow-900/50">
        <ChartColumn className="mb-2 size-8 text-yellow-600 dark:text-yellow-400" />
        <p className="font-medium text-sm">Final Score</p>
        <p className="font-bold text-2xl text-yellow-600 dark:text-yellow-400">
          {result.percentage.toFixed(0)}%
        </p>
      </Card>

      <Card className="flex flex-col items-center rounded-lg bg-secondary p-4">
        <CheckCircle className="mb-2 size-8 text-green-500" />
        <p className="font-medium text-sm">Correct Answers</p>
        <p className="font-bold text-2xl text-green-500">
          {result.correctAnswers}/{result.totalQuestions}
        </p>
      </Card>

      <Card className="flex flex-col items-center rounded-lg bg-secondary p-4">
        <Timer className="mb-2 size-8 text-blue-500" />
        <p className="font-medium text-sm">Time Spent</p>
        <p className="font-bold text-2xl text-blue-500">{result.timeSpent}s</p>
      </Card>

      <Card className="flex flex-col items-center rounded-lg bg-yellow-100 p-4 dark:bg-yellow-900/50">
        <BrainCircuit className="mb-2 size-8 text-yellow-600 dark:text-yellow-400" />
        <p className="font-medium text-sm">Performance Level</p>
        <p
          className={`font-bold text-2xl ${getPerformanceColor(result.percentage)}`}
        >
          {getPerformanceLevel(result.percentage)}
        </p>
      </Card>
    </div>
  );
}
