"use client";

import { useQuizNavigation } from "@/hooks/quiz/use-quiz-navigation";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import type { QuizNavigationProps } from "@/types/quiz-take";
import { useState } from "react";
import { QuizDeleteDialog } from "./quiz-delete-dialog";
import { QuizFeedback } from "./quiz-feedback";
import { QuizMainNavigation } from "./quiz-main-navigation";

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
  quiz, // Add quiz object to get the slug
}: QuizNavigationProps & { quiz?: any }) {
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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { goQuizEdit } = useLocalizedNavigation();

  const handleRestartQuiz = () => {
    console.log("Restart quiz clicked");
    window.location.reload();
  };

  const handleEditQuiz = () => {
    if (quiz?.slug && quizId) {
      goQuizEdit(quizId, quiz.slug);
    } else if (quizId) {
      goQuizEdit(quizId);
    }
  };

  const handleResetQuiz = () => {
    console.log("Reset quiz clicked");
    window.location.reload();
  };

  const handleDeleteQuiz = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteQuiz = () => {
    console.log("Delete quiz confirmed");
    setShowDeleteDialog(false);
  };

  const handleShare = () => {
    console.log("Share clicked");
  };

  // Render feedback UI when needed
  if (showFeedbackUI && currentQuestionResult) {
    return (
      <QuizFeedback
        currentQuestion={currentQuestion}
        currentQuestionResult={currentQuestionResult}
        questions={questions}
        isCorrect={isCorrect}
        hasPreviousQuestion={hasPreviousQuestion}
        hasNextQuestion={hasNextQuestion}
        onPrevious={onPrevious}
        onNext={onNext}
        onRetry={onRetry || (() => {})} // Provide default function if undefined
        onRestartQuiz={handleRestartQuiz}
      />
    );
  }

  // Render main navigation UI
  return (
    <>
      <QuizMainNavigation
        hasPreviousQuestion={hasPreviousQuestion}
        hasNextQuestion={hasNextQuestion}
        isAnswered={isAnswered}
        mode={mode}
        onPrevious={onPrevious}
        onNext={onNext}
        onSubmit={onSubmit}
        onRestartQuiz={handleRestartQuiz}
        onEditQuiz={handleEditQuiz}
        onResetQuiz={handleResetQuiz}
        onDeleteQuiz={handleDeleteQuiz}
        onShare={handleShare}
      />
      <QuizDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteQuiz}
      />
    </>
  );
}
