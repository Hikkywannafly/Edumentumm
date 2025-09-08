"use client";

import { Button } from "@/components/ui/button";
import type { QuizNavigationProps } from "@/types/quiz-take";
import { ArrowRight, Bot, RefreshCw, RotateCcw } from "lucide-react";
export function QuizNavigation({
  currentQuestion,
  totalQuestions = 1,
  answers,
  showFeedback = false,
  currentQuestionResult,
  onRetry,
  onNext,
}: QuizNavigationProps) {
  const handleRestartQuiz = () => {};

  const handleNext = () => {
    if (onNext) {
      onNext();
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleAskAI = () => {
    console.log("Ask AI for explanation clicked");
  };

  const currentAnswer = answers.find((answer) => {
    const questionId = `q${currentQuestion + 1}`;
    return (
      answer.questionId === questionId ||
      answer.questionId.toString() === questionId
    );
  });
  const isAnswered = !!currentAnswer;

  const hasNextQuestion = currentQuestion < totalQuestions - 1;

  return (
    <div className="space-y-6">
      <div className="fixed right-0 bottom-0 left-0 z-50">
        {showFeedback && currentQuestionResult && (
          <div
            className={`${currentQuestionResult.isCorrect ? "bg-green-600" : "bg-red-600"} text-white`}
          >
            <div className="mx-auto max-w-4xl px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-lg">
                    {currentQuestionResult.isCorrect
                      ? "Correct!"
                      : "Incorrect!"}
                  </h3>
                  {!currentQuestionResult.isCorrect && (
                    <p
                      className={`${currentQuestionResult.isCorrect ? "text-green-100" : "text-red-100"} text-sm`}
                    >
                      The correct answer was selected.
                    </p>
                  )}
                  {currentQuestionResult.explanation && (
                    <p
                      className={`${currentQuestionResult.isCorrect ? "text-green-100" : "text-red-100"} mt-1 text-sm`}
                    >
                      {currentQuestionResult.explanation}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAskAI}
                    className={`${currentQuestionResult.isCorrect ? "border-green-400 bg-green-500 hover:bg-green-400" : "border-red-400 bg-red-500 hover:bg-red-400"} text-white`}
                  >
                    <Bot className="mr-1 h-4 w-4" />
                    Ask AI for explanation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRestartQuiz}
                    className={`${currentQuestionResult.isCorrect ? "border-green-400 bg-green-500 hover:bg-green-400" : "border-red-400 bg-red-500 hover:bg-red-400"} text-white`}
                  >
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Restart quiz
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className={`${currentQuestionResult.isCorrect ? "border-green-400 bg-green-500 hover:bg-green-400" : "border-red-400 bg-red-500 hover:bg-red-400"} text-white`}
                  >
                    <RefreshCw className="mr-1 h-4 w-4" />
                    Retry
                  </Button>
                  {hasNextQuestion && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      className={`${
                        currentQuestionResult.isCorrect
                          ? "border-green-400 bg-green-500 hover:bg-green-400"
                          : "border-red-400 bg-red-500 hover:bg-red-400"
                      } text-white hover:text-white`}
                    >
                      Next
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {!showFeedback && (
          <div className="">
            <div className="mx-auto max-w-4xl ">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isAnswered && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <RefreshCw className="mr-1 h-4 w-4" />
                      Retry
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isAnswered && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAskAI}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <Bot className="mr-1 h-4 w-4" />
                      Ask AI
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
