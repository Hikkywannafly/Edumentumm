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
  questions = [],
  quizId,
  quiz,
  mode, // Add mode prop
}: QuizNavigationProps & { quiz?: any }) {
  // Get the current question ID
  const currentQuestionId = questions[currentQuestion]?.id;
  const currentQuestionType = questions[currentQuestion]?.type;

  const {
    hasNextQuestion,
    hasPreviousQuestion,
    showFeedbackUI,
    isCorrect,
    isAnswered,
  } = useQuizNavigation({
    currentQuestionIndex: currentQuestion,
    totalQuestions,
    showFeedback,
    currentQuestionResult: currentQuestionResult ?? null,
    answers, // Pass answers array
    currentQuestionId, // Pass current question ID
  });

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

  const handleShare = () => {};

  // Check if current question requires text input (for validation)
  const isTextInputQuestion = useMemo(() => {
    return (
      currentQuestionType === "FILL_BLANK" ||
      currentQuestionType === "FREE_RESPONSE"
    );
  }, [currentQuestionType]);

  // Check if text input is valid for text-based questions
  const isTextInputValid = useMemo(() => {
    if (!isTextInputQuestion) return true;

    const currentAnswer = answers.find(
      (a) => a.questionId === currentQuestionId,
    );
    return (
      currentAnswer &&
      currentAnswer.selectedOptionId &&
      currentAnswer.selectedOptionId.trim() !== ""
    );
  }, [isTextInputQuestion, answers, currentQuestionId]);

  const finalIsAnswered = useMemo(() => {
    return isAnswered && (isTextInputQuestion ? isTextInputValid : true);
  }, [isAnswered, isTextInputQuestion, isTextInputValid]);

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
        isAnswered={!!finalIsAnswered}
        onPrevious={onPrevious}
        onNext={onNext}
        onSubmit={onSubmit}
        onRestartQuiz={handleRestartQuiz}
        onEditQuiz={handleEditQuiz}
        onResetQuiz={handleResetQuiz}
        onDeleteQuiz={handleDeleteQuiz}
        onShare={handleShare}
        isTextInputQuestion={!!isTextInputQuestion}
        isTextInputValid={!!isTextInputValid}
        mode={mode} // Pass mode prop
      />
      <QuizDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteQuiz}
      />
    </>
  );
}
