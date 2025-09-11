"use client";

import { Button } from "@/components/ui/button";
import type { QuizQuestionResult } from "@/types/quiz-take";
import { ArrowLeft, ArrowRight, Bot, RefreshCw, RotateCcw } from "lucide-react";
import { useState } from "react";

interface QuizFeedbackProps {
  currentQuestion: number;
  currentQuestionResult: QuizQuestionResult;
  questions: any[];
  isCorrect: boolean | null;
  hasPreviousQuestion: boolean;
  hasNextQuestion: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onRetry: () => void;
  onRestartQuiz: () => void;
  onSubmit?: () => void; // Add onSubmit prop
}

export function QuizFeedback({
  currentQuestion,
  currentQuestionResult,
  questions,
  isCorrect,
  hasPreviousQuestion,
  hasNextQuestion,
  onPrevious,
  onNext,
  onRetry,
  onRestartQuiz,
  onSubmit, // Destructure onSubmit prop
}: QuizFeedbackProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const getCorrectAnswerText = () => {
    if (!currentQuestionResult || !questions || questions.length === 0) {
      return "Correct answer";
    }

    const currentQuestionData = questions[currentQuestion];
    if (!currentQuestionData || !currentQuestionData.options) {
      return currentQuestionResult.correctAnswer || "Correct answer";
    }

    const correctOption = currentQuestionData.options.find(
      (option: any) => option.id === currentQuestionResult.correctAnswer,
    );

    return correctOption
      ? correctOption.text
      : currentQuestionResult.correctAnswer || "Correct answer";
  };

  const handleShowExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  const handleAskAI = () => {
    console.log("Ask AI for explanation clicked");
  };

  return (
    <div
      className={`sticky bottom-0 left-0 z-10 w-full p-4 text-white sm:px-6 md:p-8 ${isCorrect ? "bg-green-900" : "bg-red-900"}`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 md:flex-nowrap md:gap-8">
        <div className="flex grow items-center md:w-3/5">
          <div
            className={`${isCorrect ? "text-green-200" : "text-red-200"}dark:${isCorrect ? "text-green-300" : "text-red-300"}[&_ol>li::marker]:${isCorrect ? "text-green-200" : "text-red-200"}dark:[&_ol>li::marker]:${isCorrect ? "text-green-300" : "text-red-300"}[&_ul>li::marker]:${isCorrect ? "text-green-200" : "text-red-200"}dark:[&_ul>li::marker]:${isCorrect ? "text-green-300" : "text-red-300"}`}
          >
            <p className="font-semibold text-xl">
              {isCorrect ? "Correct!" : "Incorrect!"}
            </p>
            <div className="space-y-2 text-white">
              <span className="block">
                The answer is:{" "}
                <div
                  className={`prose prose-sm ${isCorrect ? "text-green-200" : "text-red-200"} md:prose-lg dark:${isCorrect ? "text-green-300" : "text-red-300"} inline-block max-w-none font-semibold prose-strong:${isCorrect ? "text-green-200" : "text-red-200"}dark:prose-strong:${isCorrect ? "text-green-300" : "text-red-300"}[&_ol>li::marker]:${isCorrect ? "text-green-200" : "text-red-200"}dark:[&_ol>li::marker]:${isCorrect ? "text-green-300" : "text-red-300"}[&_ul>li::marker]:${isCorrect ? "text-green-200" : "text-red-200"}dark:[&_ul>li::marker]:${isCorrect ? "text-green-300" : "text-red-300"}`}
                >
                  {getCorrectAnswerText()}
                </div>
              </span>
              {showExplanation && currentQuestionResult?.explanation && (
                <div className="mt-2 rounded-lg bg-black/20 p-3">
                  <p className="text-sm md:text-base">
                    {currentQuestionResult.explanation}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAskAI}
                  className={`flex items-center rounded-2xl ${isCorrect ? "bg-green-600 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-700" : "bg-red-600 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-700"} text-white`}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  Ask AI for explanation
                </Button>
                {currentQuestionResult?.explanation && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowExplanation}
                    className="flex items-center rounded-2xl border-0 bg-blue-100 text-blue-600 dark:bg-blue-100"
                  >
                    <span>
                      {showExplanation
                        ? "Hide Explanation"
                        : "Show Explanation"}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-end gap-1 sm:gap-2 md:w-2/5">
          {!isCorrect && hasPreviousQuestion && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                onPrevious();
                setShowExplanation(false);
              }}
              className="flex shrink-0 items-center rounded-2xl bg-red-600 px-2 text-white hover:bg-red-600 sm:px-3 md:flex-initial dark:bg-red-700 dark:hover:bg-red-700"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={onRestartQuiz}
            className={`flex shrink-0 items-center rounded-2xl px-2 text-white sm:px-3 md:flex-initial ${isCorrect ? "bg-green-600 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-700" : "bg-red-600 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-700"}`}
          >
            <RotateCcw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Restart quiz</span>
          </Button>
          {!isCorrect && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                onRetry();
                setShowExplanation(false);
              }}
              className="flex shrink-0 items-center rounded-2xl bg-red-600 px-2 text-white hover:bg-red-600 sm:px-3 md:flex-initial dark:bg-red-700 dark:hover:bg-red-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Retry</span>
            </Button>
          )}
          {hasNextQuestion ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                onNext();
                setShowExplanation(false);
              }}
              className={`flex min-w-0 flex-1 items-center rounded-2xl px-3 text-white sm:min-w-fit sm:flex-initial ${isCorrect ? "bg-green-600 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-700" : "bg-red-600 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-700"}`}
            >
              <span className="truncate">Next</span>
              <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                onSubmit && onSubmit();
                setShowExplanation(false);
              }}
              className={`flex min-w-0 flex-1 items-center rounded-2xl px-3 text-white sm:min-w-fit sm:flex-initial ${isCorrect ? "bg-green-600 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-700" : "bg-red-600 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-700"}`}
            >
              <span className="truncate">Submit</span>
              <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
