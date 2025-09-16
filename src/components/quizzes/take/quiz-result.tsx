"use client";

import type { QuizResultProps } from "@/types/quiz-take";
import { QuizResultConsolidated } from "./quiz-result-consolidated";

export function QuizResult({
  result,
  quiz,
  onRetake,
  onBackToQuizzes,
}: QuizResultProps) {
  return (
    <div className="mx-auto max-w-4xl py-6">
      <QuizResultConsolidated
        result={result}
        quiz={quiz}
        onRetake={onRetake}
        onBackToQuizzes={onBackToQuizzes}
      />
    </div>
  );
}
