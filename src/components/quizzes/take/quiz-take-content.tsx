"use client";

import { Button } from "@/components/ui/button";
import { useQuestionResults } from "@/hooks/quiz/use-question-results";
import { useSubmitQuizAttempt } from "@/hooks/quiz/use-quiz-attempt";
import { useQuizNavigationLogic } from "@/hooks/quiz/use-quiz-navigation-logic";
import { useQuizResults } from "@/hooks/quiz/use-quiz-results";
import type { BackendQuizEntity } from "@/types/quiz";
import type { QuizTakeMode } from "@/types/quiz-take";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";
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

  const {
    currentQuestionIndex,
    answers,
    isCompleted,
    setAnswers,
    setIsCompleted,
    handleAnswerChange,
    handleNavigateToQuestion,
    handlePrevious,
    handleNext,
    handleRetake,
  } = useQuizNavigationLogic({ questions });

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
      // Prepare data for submission
      const submitData = {
        answers: answers.map((a) => ({
          questionId: a.questionId,
          selectedOptionIds: [a.selectedOptionId],
          timeSpent: 0, // Set to 0 since we're removing time tracking
        })),
      };

      // Submit to backend
      const review = await submitAttempt({ quizId: quiz.id, data: submitData });

      // Log the review response for debugging
      console.log("Quiz submission response:", review);

      // Validate the review response
      if (!review) {
        throw new Error("Empty response from server");
      }

      // Set result and mark as completed
      setAnswers([]); // Clear answers before setting result
      setIsCompleted(true);
    } catch (error: any) {
      console.error("Failed to submit quiz:", error);

      if (error.response) {
        console.error("Error response:", error.response);
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }

      // Show user-friendly error message
      alert(
        "Failed to submit quiz. Please try again. Check console for details.",
      );

      // Fallback to local calculation if backend fails
      setAnswers([]); // Clear answers before setting result
      setIsCompleted(true);
    }
  }, [answers, quiz.id, submitAttempt, setAnswers, setIsCompleted]);

  const handleBackToQuizzes = useCallback(() => {}, []);

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
    const result = calculateResult();
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

      {/* Submission loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 dark:bg-gray-800">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Submitting your quiz...</p>
          </div>
        </div>
      )}
    </div>
  );
}
