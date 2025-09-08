"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { QuizNavigationProps } from "@/types/quiz-take";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";

export function QuizNavigation({
  currentQuestion,
  totalQuestions,
  answers,
  onNavigateToQuestion,
  onPrevious,
  onNext,
  onSubmit,
  isCompleted,
  mode = "QUIZ",
  showFeedback = false,
}: QuizNavigationProps) {
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  const getQuestionStatus = (index: number) => {
    const hasAnswer = answers.some(
      (answer) => answer.questionId === `q${index + 1}`,
    );
    const isCurrent = index === currentQuestion;

    if (isCurrent) return "current";
    if (hasAnswer) return "answered";
    return "unanswered";
  };

  const getQuestionButtonVariant = (status: string) => {
    switch (status) {
      case "current":
        return "default";
      case "answered":
        return "outline";
      case "unanswered":
        return "ghost";
      default:
        return "ghost";
    }
  };

  const getQuestionButtonClassName = (status: string) => {
    switch (status) {
      case "current":
        return "bg-blue-600 text-white hover:bg-blue-700";
      case "answered":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "unanswered":
        return "hover:bg-muted";
      default:
        return "";
    }
  };

  return (
    <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        {/* Question Grid */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium text-foreground text-sm">
              Questions ({answers.length}/{totalQuestions} answered)
            </h3>
            <div
              className={`rounded-full px-2 py-1 font-medium text-xs ${
                mode === "QUIZ"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              }`}
            >
              {mode === "QUIZ" ? "Quiz Mode" : "Exam Mode"}
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
            {Array.from({ length: totalQuestions }, (_, index) => {
              const status = getQuestionStatus(index);
              const isNavigationDisabled =
                mode === "QUIZ" && index !== currentQuestion && showFeedback;
              return (
                <Button
                  key={index}
                  variant={getQuestionButtonVariant(status)}
                  size="sm"
                  className={`h-8 w-8 p-0 text-xs ${getQuestionButtonClassName(status)} ${
                    isNavigationDisabled ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  onClick={() =>
                    !isNavigationDisabled && onNavigateToQuestion(index)
                  }
                  disabled={isNavigationDisabled}
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={isFirstQuestion || isCompleted}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {/* For Quiz mode, show Next button unless it's the last question */}
            {mode === "QUIZ" ? (
              isLastQuestion ? (
                <Button
                  onClick={onSubmit}
                  disabled={isCompleted}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Flag className="h-4 w-4" />
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNext}
                  disabled={isCompleted}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )
            ) : (
              /* For Exam mode, show both Next and Submit buttons when appropriate */
              <>
                {!isLastQuestion && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onNext}
                    disabled={isCompleted}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  onClick={onSubmit}
                  disabled={isCompleted}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Flag className="h-4 w-4" />
                  Submit {mode === "EXAM" ? "Exam" : "Quiz"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-muted-foreground text-sm">
            <span>
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
            <span>
              {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%
              complete
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
