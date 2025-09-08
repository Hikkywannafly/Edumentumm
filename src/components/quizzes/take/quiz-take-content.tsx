"use client";

import type { BackendQuizEntity } from "@/types/quiz";
import type { QuizAnswer, QuizResult, QuizTakeMode } from "@/types/quiz-take";
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentQuestionResult, setCurrentQuestionResult] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation?: string;
  } | null>(null);

  // Timer effect
  useEffect(() => {
    if (isCompleted) return;

    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isCompleted]);

  const questions = quiz.quizData?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = useCallback(
    (optionId: string) => {
      const questionId = currentQuestion.id;

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

      // Show immediate feedback in Quiz mode
      if (mode === "QUIZ") {
        const correctAnswer = currentQuestion.correctAnswer || "";
        const isCorrect = optionId === correctAnswer;
        setCurrentQuestionResult({
          isCorrect,
          correctAnswer,
          explanation: currentQuestion.explanation,
        });
        setShowFeedback(true);
      }
    },
    [
      currentQuestion.id,
      currentQuestion.correctAnswer,
      currentQuestion.explanation,
      timeSpent,
      mode,
    ],
  );

  const handleNavigateToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length && !isCompleted) {
        setCurrentQuestionIndex(index);
        setShowFeedback(false);
        setCurrentQuestionResult(null);
      }
    },
    [questions.length, isCompleted],
  );

  const handlePrevious = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      if (prev > 0) {
        setShowFeedback(false);
        setCurrentQuestionResult(null);
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      if (prev < questions.length - 1) {
        setShowFeedback(false);
        setCurrentQuestionResult(null);
        return prev + 1;
      }
      return prev;
    });
  }, [questions.length]);

  const calculateResult = useCallback((): QuizResult => {
    let correctAnswers = 0;
    let totalScore = 0;
    const maxScore = questions.reduce((sum, q) => sum + (q.points || 1), 0);

    const detailedAnswers = questions.map((question) => {
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
    const passed = percentage >= quiz.passingScore;

    return {
      score: totalScore,
      maxScore,
      percentage,
      correctAnswers,
      totalQuestions: questions.length,
      timeSpent,
      passed,
      answers: detailedAnswers,
    };
  }, [answers, questions, quiz.passingScore, timeSpent]);

  const handleSubmit = useCallback(() => {
    const quizResult = calculateResult();
    setResult(quizResult);
    setIsCompleted(true);
  }, [calculateResult]);

  const handleRetake = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeSpent(0);
    setIsCompleted(false);
    setResult(null);
    setShowFeedback(false);
    setCurrentQuestionResult(null);
  }, []);

  const handleBackToQuizzes = useCallback(() => {
    // This will be handled by the parent component or router
  }, []);

  // Get current answer
  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestion?.id,
  );

  // Show result screen
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
    <div className="flex-1 space-y-6 p-6">
      {/* Quiz Header */}
      <QuizHeader
        title={quiz.title}
        currentQuestion={currentQuestionIndex}
        totalQuestions={questions.length}
        timeSpent={timeSpent}
        estimatedTime={quiz.estimatedTime}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Question Area */}
        <div className="lg:col-span-2">
          {currentQuestion && (
            <QuizQuestion
              question={currentQuestion}
              selectedOptionId={currentAnswer?.selectedOptionId}
              onAnswerChange={handleAnswerChange}
              showResult={mode === "QUIZ" && showFeedback}
              correctOptionId={currentQuestionResult?.correctAnswer}
              mode={mode}
              isAnswered={!!currentAnswer}
            />
          )}

          {/* Immediate Feedback Panel for Quiz Mode */}
          {mode === "QUIZ" && showFeedback && currentQuestionResult && (
            <div className="mt-4">
              <div
                className={`rounded-lg border p-4 ${
                  currentQuestionResult.isCorrect
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                    : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  {currentQuestionResult.isCorrect ? (
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600">
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="font-semibold">Correct!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600">
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                      <span className="font-semibold">Incorrect</span>
                    </div>
                  )}
                </div>
                {currentQuestionResult.explanation && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {currentQuestionResult.explanation}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
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
          />
        </div>
      </div>
    </div>
  );
}
