"use client";

import { useQuizNavigation } from "@/hooks/quiz/use-quiz-navigation";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import type { QuizNavigationProps } from "@/types/quiz-take";
import { useMemo, useState } from "react";
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
  // Get the current question ID
  const currentQuestionId = questions[currentQuestion]?.id;

  const { hasNextQuestion, hasPreviousQuestion, showFeedbackUI, isCorrect } =
    useQuizNavigation({
      currentQuestionIndex: currentQuestion,
      totalQuestions,
      showFeedback,
      currentQuestionResult: currentQuestionResult ?? null,
    });

  // Calculate isAnswered in the component since we need the question ID
  const isAnswered = useMemo(() => {
    if (!currentQuestionId) return false;
    return answers.some((a) => a.questionId === currentQuestionId);
  }, [answers, currentQuestionId]);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { goQuizEdit } = useLocalizedNavigation();

  const handleRestartQuiz = () => {
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
    window.location.reload();
  };

  const handleDeleteQuiz = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteQuiz = () => {
    setShowDeleteDialog(false);
  };

  const handleShare = () => {
    // Share functionality
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
        onRetry={onRetry || (() => {})}
        onRestartQuiz={handleRestartQuiz}
        onSubmit={onSubmit}
      />
    );
  }

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
