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

  const handleBackToQuizzes = useCallback(() => {}, []);

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
    <div>
      <QuizHeader
        title={quiz.title}
        currentQuestion={currentQuestionIndex}
        totalQuestions={questions.length}
        timeSpent={timeSpent}
        estimatedTime={quiz.estimatedTime}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Question Area */}
        <div className="mb-8">
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
          onRetry={() => {
            const questionId = currentQuestion.id;
            setAnswers((prev) =>
              prev.filter((a) => a.questionId !== questionId),
            );
            setShowFeedback(false);
            setCurrentQuestionResult(null);
          }}
        />
      </div>
    </div>
  );
}
