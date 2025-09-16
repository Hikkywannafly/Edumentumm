"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface ResultActionButtonsProps {
  onRetake: () => void;
  onBackToQuizzes: () => void;
}

export function ResultActionButtons({
  onRetake,
  onBackToQuizzes,
}: ResultActionButtonsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      <Button
        onClick={onRetake}
        className="flex items-center gap-2 rounded-xl px-6 py-3 transition-all hover:shadow-md"
        size="lg"
      >
        <RotateCcw className="h-5 w-5" />
        Retake Quiz
      </Button>

      <Button
        variant="outline"
        onClick={onBackToQuizzes}
        className="flex items-center gap-2 rounded-xl px-6 py-3 transition-all hover:shadow-md"
        size="lg"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Quizzes
      </Button>
    </div>
  );
}
