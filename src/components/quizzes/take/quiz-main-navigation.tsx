"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { QuizMainNavigationProps } from "@/types/quiz-take";
import {
  ArrowRight,
  Edit,
  RotateCcw,
  Settings,
  Share,
  Trash2,
  Undo,
} from "lucide-react";
import { useState } from "react";
import { QuizWarningDialog } from "./quiz-warning-dialog";

interface QuizMainNavigationPropsExtended extends QuizMainNavigationProps {
  isTextInputQuestion?: boolean;
  isTextInputValid?: boolean;
  mode?: string;
}

export function QuizMainNavigation({
  hasPreviousQuestion,
  hasNextQuestion,
  isAnswered,
  onPrevious,
  onNext,
  onSubmit,
  onRestartQuiz,
  onEditQuiz,
  onResetQuiz,
  onDeleteQuiz,
  onShare,
  isTextInputQuestion = false,
  isTextInputValid = true,
  mode, // Destructure mode prop
}: QuizMainNavigationPropsExtended) {
  const [showWarning, setShowWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const getWarningMessage = () => {
    if (isTextInputQuestion) {
      return "Please provide an answer before moving to the next question.";
    }
    return "Please select an answer before moving to the next question.";
  };

  // In exam mode, we don't show warnings for unanswered questions
  const shouldShowWarning = mode !== "EXAM" && !isAnswered;

  const handleNext = () => {
    if (isTextInputQuestion && !isTextInputValid) {
      setPendingAction(() => onNext);
      setShowWarning(true);
    } else if (shouldShowWarning) {
      setPendingAction(() => onNext);
      setShowWarning(true);
    } else {
      onNext();
    }
  };

  const handleSubmit = () => {
    if (isTextInputQuestion && !isTextInputValid) {
      setPendingAction(() => onSubmit);
      setShowWarning(true);
    } else if (shouldShowWarning) {
      setPendingAction(() => onSubmit);
      setShowWarning(true);
    } else {
      onSubmit();
    }
  };

  const handleWarningConfirm = () => {
    setShowWarning(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  return (
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
                onClick={onEditQuiz}
                className="cursor-pointer py-2 focus:bg-secondary"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Quiz
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onResetQuiz}
                className="cursor-pointer py-2 focus:bg-secondary"
              >
                <Undo className="mr-2 h-4 w-4" />
                Reset Quiz
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDeleteQuiz}
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
            onClick={onShare}
          >
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>

        <div className="flex w-full items-center justify-end gap-1 sm:gap-2 md:w-2/5">
          <Button
            variant="default"
            size="sm"
            onClick={onRestartQuiz}
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
                onClick={onPrevious}
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
              >
                <span className="truncate">Next</span>
                <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmit}
                className="flex min-w-0 flex-1 items-center rounded-2xl px-3 sm:min-w-fit sm:flex-initial"
              >
                <span className="truncate">Submit</span>
                <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
              </Button>
            )}
          </>
        </div>
      </div>
      <QuizWarningDialog
        open={showWarning}
        onOpenChange={setShowWarning}
        onConfirm={handleWarningConfirm}
        customMessage={getWarningMessage()}
      />
    </div>
  );
}
