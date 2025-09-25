"use client";

import { Button } from "@/components/ui/button";
import { useQuizNavigationContext } from "@/contexts/quiz-navigation-context";
import { useQuestionResults } from "@/hooks/quiz/use-question-results";
import { useSubmitQuizAttempt } from "@/hooks/quiz/use-quiz-attempt";
import { useQuizNavigationLogic } from "@/hooks/quiz/use-quiz-navigation-logic";
import { useQuizProgress } from "@/hooks/quiz/use-quiz-progress";
import { useQuizResults } from "@/hooks/quiz/use-quiz-results";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import type { BackendQuizEntity } from "@/types/quiz";
import type { QuizTakeMode } from "@/types/quiz-take";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { QuizExitConfirmationDialog } from "./quiz-exit-confirmation-dialog";
import { QuizHeader } from "./quiz-header";
import { QuizNavigation } from "./quiz-navigation";
import { QuizQuestion } from "./quiz-question";
import { QuizResult as QuizResultComponent } from "./quiz-result";

interface QuizTakeContentProps {
  quiz: BackendQuizEntity;
  mode?: QuizTakeMode;
}

export function QuizTakeContent({ quiz, mode = "QUIZ" }: QuizTakeContentProps) {
  const questions = quiz.quizData?.questions || [];
  const [showExitDialog, setShowExitDialog] = useState(false);
  const { goBack } = useLocalizedNavigation();
  const { setIsQuizInProgress, setQuizHasAnswers } = useQuizNavigationContext();

  const {
    currentQuestionIndex,
    answers,
    isCompleted,
    setCurrentQuestionIndex,
    setAnswers,
    setIsCompleted,
    handleAnswerChange,
    handleNavigateToQuestion,
    handlePrevious,
    handleNext,
    handleRetake,
    getTotalTimeSpent,
  } = useQuizNavigationLogic({ questions });

  // Update quiz navigation context
  useEffect(() => {
    setIsQuizInProgress(true);
    setQuizHasAnswers(answers.length > 0);

    // Cleanup function to reset context when component unmounts
    return () => {
      setIsQuizInProgress(false);
      setQuizHasAnswers(false);
    };
  }, [answers.length, setIsQuizInProgress, setQuizHasAnswers]);

  // Use the quiz progress hook
  useQuizProgress({
    quizId: quiz.id.toString(),
    currentQuestionIndex,
    answers,
  });

  // Handle browser back/refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isCompleted && answers.length > 0) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved progress. Are you sure you want to leave?";
        return "You have unsaved progress. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isCompleted, answers.length]);

  const handleExitQuiz = useCallback(() => {
    if (!isCompleted && answers.length > 0) {
      setShowExitDialog(true);
    } else {
      goBack();
    }
  }, [isCompleted, answers.length, goBack]);

  const confirmExitQuiz = useCallback(() => {
    try {
      const progress = {
        currentQuestionIndex,
        answers,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `quiz-progress-${quiz.id}`,
        JSON.stringify(progress),
      );
    } catch (error) {
      console.warn("Failed to save quiz progress:", error);
    }
    setShowExitDialog(false);
    goBack();
  }, [currentQuestionIndex, answers, quiz.id, goBack]);
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(`quiz-progress-${quiz.id}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);

        if (Date.now() - progress.timestamp < 3600000) {
          setCurrentQuestionIndex(progress.currentQuestionIndex);
          setAnswers(progress.answers);
        }
      }
    } catch (error) {
      console.warn("Failed to load quiz progress:", error);
    }
  }, [quiz.id, setCurrentQuestionIndex, setAnswers]);

  const { getQuestionResult } = useQuestionResults({
    questions,
    answers,
  });

  const { calculateResult } = useQuizResults({
    quiz,
    questions,
    answers,
  });

  const { mutateAsync: submitAttempt, isPending: isSubmitting } =
    useSubmitQuizAttempt();

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionResult = currentQuestion
    ? getQuestionResult(currentQuestion.id)
    : null;

  const showFeedback = mode === "QUIZ" && !!currentQuestionResult;

  const handleSubmit = useCallback(async () => {
    try {
      const totalTimeSpent = getTotalTimeSpent();
      const submitData = {
        answers: answers.map((a) => ({
          questionId: a.questionId,
          selectedOptionIds: [a.selectedOptionId],
          timeSpent: a.timeSpent, // Use actual time spent per question
        })),
        totalTimeSpent: totalTimeSpent, // Include total time in submission as a workaround
      };

      const review = await submitAttempt({ quizId: quiz.id, data: submitData });
      if (!review) {
        throw new Error("Empty response from server");
      }
      setIsCompleted(true);
      // Clear progress on successful submission
      localStorage.removeItem(`quiz-progress-${quiz.id}`);
    } catch (error: any) {
      console.error("Failed to submit quiz:", error);

      alert(
        "Failed to submit quiz. Please try again. Check console for details.",
      );

      setIsCompleted(true);
    }
  }, [answers, quiz.id, submitAttempt, setIsCompleted, getTotalTimeSpent]);

  const handleBackToQuizzes = useCallback(() => {
    handleExitQuiz();
  }, [handleExitQuiz]);

  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestion?.id,
  );

  // Loading state
  if (!quiz || !questions) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">No Questions Available</h2>
          <p className="mb-6 text-muted-foreground">
            This quiz doesn't have any questions yet.
          </p>
          <Button onClick={handleBackToQuizzes}>Back to Quizzes</Button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    const totalTimeSpent = getTotalTimeSpent();
    const result = calculateResult(totalTimeSpent);
    return (
      <div className="flex-1 p-6">
        <QuizResultComponent
          result={result}
          quiz={quiz}
          onRetake={handleRetake}
          onBackToQuizzes={handleBackToQuizzes}
        />
      </div>
    );
  }

  // Show quiz interface
  return (
    <div className="flex min-h-screen flex-col justify-between">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <QuizHeader
          title={quiz.title}
          currentQuestion={currentQuestionIndex}
          totalQuestions={questions.length}
          mode={mode}
        />
      </div>
      <div className="mx-auto max-w-4xl flex-grow px-4 py-8">
        <div className="mb-8">
          {currentQuestion && (
            <QuizQuestion
              question={currentQuestion}
              selectedOptionId={currentAnswer?.selectedOptionId}
              onAnswerChange={(optionId) =>
                handleAnswerChange(currentQuestion.id, optionId)
              }
              showResult={showFeedback}
              correctOptionId={currentQuestionResult?.correctAnswer}
              mode={mode}
              showTextResult={
                showFeedback &&
                (currentQuestion?.type === "FILL_BLANK" ||
                  currentQuestion?.type === "FREE_RESPONSE")
              }
            />
          )}
        </div>
      </div>
      <QuizNavigation
        currentQuestion={currentQuestionIndex}
        totalQuestions={questions.length}
        answers={answers}
        onNavigateToQuestion={handleNavigateToQuestion}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isCompleted={isCompleted}
        mode={mode}
        showFeedback={showFeedback}
        currentQuestionResult={currentQuestionResult}
        questions={questions}
        quizId={quiz.id}
        onRetry={() => {
          const questionId = currentQuestion?.id;
          if (questionId) {
            setAnswers((prev) =>
              prev.filter((a) => a.questionId !== questionId),
            );
          }
        }}
        quiz={quiz}
      />
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 dark:bg-gray-800">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Submitting your quiz...</p>
          </div>
        </div>
      )}
      <QuizExitConfirmationDialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={confirmExitQuiz}
        onCancel={() => setShowExitDialog(false)}
      />
    </div>
  );
}
