"use client";

import { Button } from "@/components/ui/button";
import { useQuestionResults } from "@/hooks/quiz/use-question-results";
import { useSubmitQuizAttempt } from "@/hooks/quiz/use-quiz-attempt";
import type { BackendQuizEntity } from "@/types/quiz";
import type { QuizAnswer, QuizResult, QuizTakeMode } from "@/types/quiz-take";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { QuizHeader } from "./quiz-header";
import { QuizNavigation } from "./quiz-navigation";
import { QuizQuestion } from "./quiz-question";
import { QuizResult as QuizResultComponent } from "./quiz-result";

interface QuizTakeContentProps {
  quiz: BackendQuizEntity;
  mode?: QuizTakeMode;
}

export function QuizTakeContent({ quiz, mode = "QUIZ" }: QuizTakeContentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [startTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const { mutateAsync: submitAttempt, isPending: isSubmitting } =
    useSubmitQuizAttempt();

  useEffect(() => {
    if (isCompleted) return;

    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isCompleted]);

  const questions = quiz.quizData?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const { getQuestionResult } = useQuestionResults({
    questions,
    answers,
  });

  const currentQuestionResult = currentQuestion
    ? getQuestionResult(currentQuestion.id)
    : null;

  const showFeedback = mode === "QUIZ" && !!currentQuestionResult;

  const handleAnswerChange = useCallback(
    (optionId: string) => {
      const questionId = currentQuestion?.id;

      // Ensure we have a valid question ID
      if (!questionId) return;

      setAnswers((prev) => {
        const existing = prev.find((a) => a.questionId === questionId);
        if (existing) {
          return prev.map((a) =>
            a.questionId === questionId
              ? { ...a, selectedOptionId: optionId, timeSpent: timeSpent }
              : a,
          );
        }
        return [...prev, { questionId, selectedOptionId: optionId, timeSpent }];
      });
    },
    [currentQuestion?.id, timeSpent],
  );

  const handleNavigateToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length && !isCompleted) {
        setCurrentQuestionIndex(index);
      }
    },
    [questions.length, isCompleted],
  );

  const handlePrevious = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      if (prev < questions.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [questions.length]);

  const calculateResult = useCallback((): QuizResult => {
    let correctAnswers = 0;
    let totalScore = 0;
    const maxScore =
      questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;

    const detailedAnswers = (questions || []).map((question) => {
      const userAnswer = answers.find((a) => a.questionId === question.id);
      const correctOptionId = question.correctAnswer || "";
      const isCorrect = userAnswer?.selectedOptionId === correctOptionId;

      if (isCorrect) {
        correctAnswers++;
        totalScore += question.points || 1;
      }

      return {
        questionId: question.id,
        selectedOptionId: userAnswer?.selectedOptionId || "",
        correctOptionId,
        isCorrect,
        question,
      };
    });

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = percentage >= (quiz.passingScore || 70); // Default to 70% if not set

    return {
      score: totalScore,
      maxScore,
      percentage,
      correctAnswers,
      totalQuestions: questions?.length || 0,
      timeSpent,
      passed,
      answers: detailedAnswers,
    };
  }, [answers, questions, quiz.passingScore, timeSpent]);

  const handleSubmit = useCallback(async () => {
    try {
      // Prepare data for submission
      const submitData = {
        answers: answers.map((a) => ({
          questionId: a.questionId,
          selectedOptionIds: [a.selectedOptionId],
          timeSpent: a.timeSpent,
        })),
        startedAt: new Date(startTime).toISOString(),
        completedAt: new Date().toISOString(),
        timeSpentSec: timeSpent,
      };

      // Submit to backend
      const review = await submitAttempt({ quizId: quiz.id, data: submitData });

      // Log the review response for debugging
      console.log("Quiz submission response:", review);

      // Validate the review response
      if (!review) {
        throw new Error("Empty response from server");
      }

      // Convert backend response to frontend format
      const quizResult: QuizResult = {
        score: review.score,
        maxScore: review.maxScore,
        percentage: review.finalScorePercent,
        correctAnswers: review.correct,
        totalQuestions: review.questions?.length || 0,
        timeSpent: review.timeSpentSec,
        passed: review.score >= (quiz.passingScore || 70), // Default to 70% if not set
        answers: (review.questions || []).map((q) => ({
          questionId: q.questionId,
          selectedOptionId: q.selectedOptionIds?.[0] || "",
          correctOptionId: q.correctOptionIds?.[0] || "",
          isCorrect: q.isCorrect,
          question: {
            id: q.questionId,
            text: q.questionText,
            type: "MULTIPLE_CHOICE",
            points: q.pointsPossible,
            options: q.options || [],
            correctAnswer: q.correctOptionIds?.[0] || "",
            explanation: q.explanation,
          },
        })),
      };

      setResult(quizResult);
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
      const quizResult = calculateResult();
      setResult(quizResult);
      setIsCompleted(true);
    }
  }, [
    answers,
    calculateResult,
    quiz.id,
    quiz.passingScore,
    startTime,
    timeSpent,
    submitAttempt,
  ]);

  const handleRetake = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeSpent(0);
    setIsCompleted(false);
    setResult(null);
  }, []);

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

  if (isCompleted && result) {
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
          timeSpent={timeSpent}
          estimatedTime={quiz.estimatedTime}
          mode={mode}
        />
      </div>
      <div className="mx-auto max-w-4xl flex-grow px-4 py-8">
        <div className="mb-8">
          {currentQuestion && (
            <QuizQuestion
              question={currentQuestion}
              selectedOptionId={currentAnswer?.selectedOptionId}
              onAnswerChange={handleAnswerChange}
              showResult={mode === "QUIZ" && !!currentQuestionResult}
              correctOptionId={currentQuestionResult?.correctAnswer}
              mode={mode}
              isAnswered={!!currentAnswer}
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
