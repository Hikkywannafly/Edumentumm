"use client";

import { HtmlViewer } from "@/components/shared/editor/html-viewer";
import { Button } from "@/components/ui/button";
import type { QuizHeaderProps } from "@/types/quiz-take";
import { Copy, Dices } from "lucide-react";

export function QuizHeader({
  title,
  currentQuestion,
  totalQuestions,
  estimatedTime,
  timeSpent,
  mode = "QUIZ",
}: QuizHeaderProps & { mode?: "QUIZ" | "EXAM" }) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleRandomQuiz = () => {
    // This would be implemented to navigate to a random quiz
    console.log("Navigate to random quiz");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getModeDescription = () => {
    if (mode === "QUIZ") {
      return "You receive immediate feedback after each question.";
    }
    return "All feedback is provided at the end of the quiz.";
  };

  return (
    <div className="w-full">
      <h1 className="hidden">{title}</h1>
      <div className="prose prose-sm md:prose-lg mt-4 max-w-none text-center font-medium text-base text-muted-foreground sm:text-lg md:mt-8 lg:mt-12">
        <HtmlViewer content={title} />
      </div>
      <div className="mt-2 flex w-full flex-wrap items-center justify-center gap-3 sm:gap-4 md:flex-nowrap">
        <div
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={((currentQuestion + 1) / totalQuestions) * 100}
          role="progressbar"
          tabIndex={0}
          data-state="indeterminate"
          data-max="100"
          className="relative h-4 w-full flex-1 overflow-hidden rounded-full bg-secondary"
        >
          <div
            data-state="indeterminate"
            data-max="100"
            className="size-full flex-1 bg-primary transition-all"
            style={{
              transform: `translateX(-${100 - ((currentQuestion + 1) / totalQuestions) * 100}%)`,
            }}
          />
        </div>
        <div className="shrink-0 text-right font-semibold text-lg sm:text-xl">
          {currentQuestion + 1} / {totalQuestions}
        </div>
        <div className="flex gap-2">
          <Button
            className="inline-flex size-10 shrink-0 select-none items-center justify-center rounded-2xl border border-input font-medium text-sm ring-offset-background transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleRandomQuiz}
            variant="outline"
            size="icon"
          >
            <Dices className="size-4" />
          </Button>
          <Button
            className="inline-flex size-10 shrink-0 select-none items-center justify-center rounded-2xl border border-input font-medium text-sm ring-offset-background transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleCopyLink}
            variant="outline"
            size="icon"
          >
            <Copy className="size-4" />
          </Button>
        </div>
      </div>
      {estimatedTime && (
        <div className="mt-2 text-center text-muted-foreground text-sm">
          Time: {formatTime(timeSpent)} / {formatTime(estimatedTime * 60)}
        </div>
      )}
      <div className="mt-2 text-center text-muted-foreground text-sm">
        {getModeDescription()}
      </div>
    </div>
  );
}
