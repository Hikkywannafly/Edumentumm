"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuizNavigation } from "@/hooks/quiz/use-quiz-navigation";
import type { QuizNavigationProps } from "@/types/quiz-take";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Edit,
  RefreshCw,
  RotateCcw,
  Settings,
  Share,
  Trash2,
  Undo,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function QuizNavigation({
  currentQuestion,
  totalQuestions = 1,
  answers,
  showFeedback = false,
  currentQuestionResult,
  onRetry,
  onNext,
  onPrevious,
  onSubmit,
  // isCompleted,
  mode = "QUIZ",
  questions = [],
  quizId,
}: QuizNavigationProps) {
  const {
    isAnswered,
    hasNextQuestion,
    hasPreviousQuestion,
    showFeedbackUI,
    isCorrect,
  } = useQuizNavigation({
    currentQuestion,
    totalQuestions,
    answers,
    showFeedback,
    currentQuestionResult: currentQuestionResult ?? null,
  });

  const [showExplanation, setShowExplanation] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const router = useRouter();

  const handleRestartQuiz = () => {
    console.log("Restart quiz clicked");
    // This would typically reset the quiz attempt
    window.location.reload();
  };

  const handleEditQuiz = () => {
    if (quizId) {
      router.push(`/quizzes/${quizId}/edit`);
    }
  };

  const handleResetQuiz = () => {
    // Reset quiz functionality - this would typically reset the user's progress
    console.log("Reset quiz clicked");
    // In a real implementation, this would reset the quiz attempt
    window.location.reload();
  };

  const handleDeleteQuiz = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteQuiz = () => {
    // Delete quiz functionality
    console.log("Delete quiz confirmed");
    // In a real implementation, this would call the delete API
    // For now, we'll just show an alert
    alert("Quiz deletion functionality would be implemented here");
    // After deletion, we would typically redirect the user
    // router.push("/quizzes");
    setShowDeleteDialog(false);
  };

  const handleShare = () => {
    console.log("Share clicked");
  };

  const handleAskAI = () => {
    console.log("Ask AI for explanation clicked");
  };

  const handlePrevious = () => {
    onPrevious?.();
    // Hide explanation when moving to previous question
    setShowExplanation(false);
  };

  const handleNext = () => {
    onNext?.();
    // Hide explanation when moving to next question
    setShowExplanation(false);
  };

  const handleRetry = () => {
    onRetry?.();
    // Hide explanation when retrying
    setShowExplanation(false);
  };

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

  if (showFeedbackUI && currentQuestionResult) {
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
                onClick={handlePrevious}
                className="flex shrink-0 items-center rounded-2xl bg-red-600 px-2 text-white hover:bg-red-600 sm:px-3 md:flex-initial dark:bg-red-700 dark:hover:bg-red-700"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={handleRestartQuiz}
              className={`flex shrink-0 items-center rounded-2xl px-2 text-white sm:px-3 md:flex-initial ${isCorrect ? "bg-green-600 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-700" : "bg-red-600 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-700"}`}
            >
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Restart quiz</span>
            </Button>
            {!isCorrect && (
              <Button
                variant="default"
                size="sm"
                onClick={handleRetry}
                className="flex shrink-0 items-center rounded-2xl bg-red-600 px-2 text-white hover:bg-red-600 sm:px-3 md:flex-initial dark:bg-red-700 dark:hover:bg-red-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Retry</span>
              </Button>
            )}
            {hasNextQuestion && (
              <Button
                variant="default"
                size="sm"
                onClick={handleNext}
                className={`flex min-w-0 flex-1 items-center rounded-2xl px-3 text-white sm:min-w-fit sm:flex-initial ${isCorrect ? "bg-green-600 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-700" : "bg-red-600 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-700"}`}
              >
                <span className="truncate">Next</span>
                <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="sticky bottom-0 left-0 z-10 w-full bg-secondary p-4 sm:px-6 md:p-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 md:flex-nowrap md:gap-8">
          <div className="flex grow items-center md:w-3/5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="flex-1 rounded-2xl px-4 py-2 md:flex-initial"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem
                  onClick={handleEditQuiz}
                  className="cursor-pointer py-2 focus:bg-secondary"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Quiz
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleResetQuiz}
                  className="cursor-pointer py-2 focus:bg-secondary"
                >
                  <Undo className="mr-2 h-4 w-4" />
                  Reset Quiz
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteQuiz}
                  className="cursor-pointer py-2 text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Quiz
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="secondary"
              className="ml-2 flex-1 shrink-0 rounded-2xl px-4 py-2 md:flex-initial"
              onClick={handleShare}
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>

          <div className="flex w-full items-center justify-end gap-1 sm:gap-2 md:w-2/5">
            <Button
              variant="default"
              size="sm"
              onClick={handleRestartQuiz}
              className="flex shrink-0 items-center rounded-2xl px-2 sm:px-3 md:flex-initial"
            >
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Restart quiz</span>
            </Button>

            <>
              {hasPreviousQuestion && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="rounded-2xl px-3"
                >
                  Previous
                </Button>
              )}

              {hasNextQuestion ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleNext}
                  className="flex min-w-0 flex-1 items-center rounded-2xl px-3 sm:min-w-fit sm:flex-initial"
                  disabled={!isAnswered && mode === "QUIZ"}
                >
                  <span className="truncate">Next</span>
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onSubmit}
                  className="flex min-w-0 flex-1 items-center rounded-2xl px-3 sm:min-w-fit sm:flex-initial"
                  disabled={!isAnswered && mode === "QUIZ"}
                >
                  <span className="truncate">Submit</span>
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                </Button>
              )}
            </>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              quiz and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteQuiz}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
