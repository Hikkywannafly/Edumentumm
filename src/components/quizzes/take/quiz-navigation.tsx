"use client";

import { Button } from "@/components/ui/button";
import type { QuizNavigationProps } from "@/types/quiz-take";
import { Bot, RefreshCw, RotateCcw } from "lucide-react";

export function QuizNavigation({
  currentQuestion,
  // totalQuestions,
  answers,

  // onNext,

  showFeedback = false,
  currentQuestionResult,
  onRetry,
}: QuizNavigationProps) {
  // const isFirstQuestion = currentQuestion === 0;
  // const isLastQuestion = currentQuestion === totalQuestions - 1;

  const handleRestartQuiz = () => {
    // Restart quiz functionality
    window.location.reload();
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleAskAI = () => {
    // Ask AI for explanation functionality
    console.log("Ask AI for explanation clicked");
  };

  // const handleSeeAnswer = () => {
  //   // See answer functionality
  //   console.log("See answer clicked");
  // };

  // Get current answer to check if question is answered
  const currentAnswer = answers.find((answer) => {
    // Try to match by different possible question ID formats
    const questionId = `q${currentQuestion + 1}`;
    return (
      answer.questionId === questionId ||
      answer.questionId.toString() === questionId
    );
  });
  const isAnswered = !!currentAnswer;

  return (
    <div className="space-y-6">
      {/* Keyboard Shortcuts Info */}
      <div className="text-center text-gray-500 text-sm dark:text-gray-400">
        <div className="mb-2 space-x-4">
          <span>
            Use{" "}
            <kbd className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
              A B C D
            </kbd>{" "}
            to select
          </span>
          <span>
            Use{" "}
            <kbd className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
              1 2 3 4
            </kbd>{" "}
            to select
          </span>
        </div>
        <div className="space-x-4">
          <span>
            Use{" "}
            <kbd className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
              ↑
            </kbd>{" "}
            and{" "}
            <kbd className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
              ↓
            </kbd>{" "}
            to navigate
          </span>
          <span>
            Use{" "}
            <kbd className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
              Enter
            </kbd>{" "}
            to continue
          </span>
        </div>
      </div>

      {/* Sticky Bottom Navigation */}
      <div className="fixed right-0 bottom-0 left-0 z-50">
        {/* Feedback Panel - Shows when answer is selected */}
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
                  {/* {!isLastQuestion ? (
                    <Button
                      size="sm"
                      onClick={onNext}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleSeeAnswer}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      See answer
                      <Eye className="ml-1 h-4 w-4" />
                    </Button>
                  )} */}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation Bar */}
        {!showFeedback && (
          <div className="">
            <div className="mx-auto max-w-4xl ">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRestartQuiz}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Restart quiz
                  </Button>
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
                  {/* {!isLastQuestion ? (
                    <Button
                      size="sm"
                      onClick={onNext}
                      disabled={!isAnswered}
                      className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleSeeAnswer}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      See answer
                      <Eye className="ml-1 h-4 w-4" />
                    </Button>
                  )} */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spacer to prevent content from being hidden behind fixed navigation */}
      {/* <div className="h-20" /> */}
    </div>
  );
}
