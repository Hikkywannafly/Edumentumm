"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuizAttemptDetail } from "@/hooks/quiz/use-quiz-attempt-detail";
import { useQuizDetail } from "@/hooks/quiz/use-quiz-detail";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { extractIdFromSlug } from "@/utils/index";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Trophy,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";

interface QuestionResultProps {
  question: any;
  index: number;
}

function QuestionResult({ question, index }: QuestionResultProps) {
  const isCorrect = question.isCorrect ?? question.correct ?? false;
  const userAnswerText =
    question.options
      .filter((opt: any) => question.selectedOptionIds.includes(opt.id))
      .map((opt: any) => opt.text)
      .join(", ") || "No answer provided";

  const correctAnswerText =
    question.options
      .filter((opt: any) => question.correctOptionIds.includes(opt.id))
      .map((opt: any) => opt.text)
      .join(", ") || "No correct answer defined";

  const showCorrectAnswer = !isCorrect;

  return (
    <div className="rounded-lg border border-border/50 p-4">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="font-semibold">
          {index + 1}. {question.questionText}
        </h3>
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="rounded bg-green-100 px-2 py-1 font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Correct
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="rounded bg-red-100 px-2 py-1 font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-400">
                Incorrect
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <h4 className="mb-2 font-medium text-muted-foreground">
            Your Answer
          </h4>
          <div
            className={`rounded-lg p-3 ${isCorrect ? " dark: border border-border/50 border-border/50-green-200 border-border/50-green-800 bg-green-100 dark:bg-green-900/30" : " dark: border border border border-border/50 border-border/50-red-200 border-border/50-red-800 bg-red-100 dark:bg-red-900/30"}`}
          >
            {userAnswerText}
          </div>
        </div>

        {showCorrectAnswer && (
          <div>
            <h4 className="mb-2 font-medium text-muted-foreground">
              Correct Answer
            </h4>
            <div className="dark: rounded-lg border border-border/50 border-border/50-green-200 border-border/50-green-800 bg-green-100 p-3 dark:bg-green-900/30">
              {correctAnswerText}
            </div>
          </div>
        )}
      </div>

      {/* Display time spent on this question if available */}
      {question.timeSpent && (
        <div className="mt-3 text-muted-foreground text-sm">
          Time spent: {question.timeSpent} seconds
        </div>
      )}

      {question.explanation && (
        <div className="mt-4 rounded-lg bg-muted p-3">
          <h4 className="mb-1 font-medium text-muted-foreground">
            Explanation
          </h4>
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

export function QuizAttemptDetailContent() {
  const params = useParams();
  const { navigate, goBack } = useLocalizedNavigation();

  const slug = params.slug as string;
  const attemptId = params.attemptId as string;
  const quizId = slug ? extractIdFromSlug(slug) : "0";

  const {
    data: quiz,
    isLoading: isQuizLoading,
    isError: isQuizError,
    error: quizError,
  } = useQuizDetail({
    id: quizId,
    enabled: !!quizId,
  });

  const {
    data: attempt,
    isLoading: isAttemptLoading,
    isError: isAttemptError,
    error: attemptError,
  } = useQuizAttemptDetail({
    attemptId,
    enabled: !!attemptId,
  });

  const handleBack = () => {
    goBack();
  };

  // Loading state
  if (isQuizLoading || isAttemptLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 space-y-6 p-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isQuizError || isAttemptError || !quiz || !attempt) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 p-6">
          <div className="text-center">
            <h3 className="mb-2 font-semibold text-destructive text-lg">
              Error loading attempt details
            </h3>
            <p className="mb-4 text-muted-foreground">
              {quizError instanceof Error
                ? quizError.message
                : attemptError instanceof Error
                  ? attemptError.message
                  : "Failed to load attempt details."}
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <div className="mb-8 rounded-xl bg-card p-6">
          <div className="mb-6">
            <h1 className="font-bold text-2xl">Attempt Review</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(attempt.completedAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {Math.floor(attempt.timeSpentSec / 60)}m{" "}
                  {attempt.timeSpentSec % 60}s
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-lg bg-secondary/50 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-lg">
                  Score: {attempt.correct}/
                  {attempt.correct + attempt.wrong + attempt.skipped}
                </div>
                <div className="text-muted-foreground">
                  {attempt.finalScorePercent.toFixed(1)}% (
                  {attempt.finalScorePercent >= (quiz.passingScore || 70)
                    ? "Passed"
                    : "Failed"}
                  )
                </div>
              </div>
              <div className="flex items-center gap-2">
                {attempt.finalScorePercent >= (quiz.passingScore || 70) ? (
                  <Trophy className="h-8 w-8 text-yellow-500" />
                ) : (
                  <Trophy className="h-8 w-8 text-muted-foreground" />
                )}
                <span className="font-semibold text-xl">
                  {attempt.finalScorePercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {attempt.questions.map((question: any, index: number) => (
              <QuestionResult
                key={question.questionId}
                question={question}
                index={index}
              />
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => navigate(`/quizzes/${slug}/take`)}
              className="w-full sm:w-auto"
            >
              Retake Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
