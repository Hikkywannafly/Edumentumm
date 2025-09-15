"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { QuizResultProps } from "@/types/quiz-take";
import {
  ArrowLeft,
  Award,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Target,
  TrendingUp,
  Trophy,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function QuizResult({ result, quiz, onRetake }: QuizResultProps) {
  const router = useRouter();
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-800 border-green-200";
    if (percentage >= 70) return "bg-blue-100 text-blue-800 border-blue-200";
    if (percentage >= 50) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 95) return "Outstanding performance! 🌟";
    if (percentage >= 85) return "Excellent work! 🎉";
    if (percentage >= 75) return "Great job! 👏";
    if (percentage >= 65) return "Good effort! 👍";
    if (percentage >= 50) return "Keep practicing! 💪";
    return "Don't give up! Try again! 🚀";
  };

  const toggleQuestionExpansion = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const getSelectedOptionText = (
    questionId: string,
    selectedOptionId: string,
    questionType?: string,
  ) => {
    const question = quiz.quizData?.questions?.find((q) => q.id === questionId);

    // For text-based questions, return the actual text answer
    if (questionType === "FILL_BLANK" || questionType === "FREE_RESPONSE") {
      return selectedOptionId || "No answer provided";
    }

    // For multiple choice questions, find the option text
    const option = question?.options?.find(
      (opt) => opt.id === selectedOptionId,
    );
    return option ? option.text : "No answer selected";
  };

  const getCorrectOptionText = (
    questionId: string,
    correctOptionId: string,
    questionType?: string,
  ) => {
    const question = quiz.quizData?.questions?.find((q) => q.id === questionId);

    // For text-based questions, return the correct answer text
    if (questionType === "FILL_BLANK" || questionType === "FREE_RESPONSE") {
      return correctOptionId || "No correct answer defined";
    }

    // For multiple choice questions, find the option text
    const option = question?.options?.find((opt) => opt.id === correctOptionId);
    return option ? option.text : "Unknown";
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Result Header */}
      <Card className="border border-border/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            {result.passed ? (
              <Trophy className="mx-auto h-16 w-16 text-yellow-500" />
            ) : (
              <Target className="mx-auto h-16 w-16 text-gray-400" />
            )}
          </div>

          <h1 className="mb-2 font-bold text-3xl text-foreground">
            Quiz Completed!
          </h1>

          <p className="mb-4 text-lg text-muted-foreground">
            {getPerformanceMessage(result.percentage)}
          </p>

          <div className="flex items-center justify-center gap-4">
            <Badge
              className={`px-4 py-2 text-lg ${getScoreBadgeColor(result.percentage)}`}
            >
              {result.score || 0}/{result.maxScore || 0} points
            </Badge>
            <Badge
              className={`px-4 py-2 text-lg ${getScoreBadgeColor(result.percentage || 0)}`}
            >
              {(result.percentage || 0).toFixed(1)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Award className="mx-auto mb-3 h-8 w-8 text-blue-600" />
            <div
              className={`font-bold text-2xl ${getScoreColor(result.percentage || 0)}`}
            >
              {(result.percentage || 0).toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-sm">Final Score</p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <CheckCircle className="mx-auto mb-3 h-8 w-8 text-green-600" />
            <div className="font-bold text-2xl text-foreground">
              {result.correctAnswers || 0}/{result.totalQuestions || 0}
            </div>
            <p className="text-muted-foreground text-sm">Correct Answers</p>
          </CardContent>
        </Card>
      </div>

      {/* Pass/Fail Status */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {result.passed ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">
                      Congratulations! You passed!
                    </p>
                    <p className="text-muted-foreground text-sm">
                      You scored above the passing score of{" "}
                      {quiz.passingScore || 70}%
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-400">
                      You didn't pass this time
                    </p>
                    <p className="text-muted-foreground text-sm">
                      You need {quiz.passingScore || 70}% to pass. Keep studying
                      and try again!
                    </p>
                  </div>
                </>
              )}
            </div>
            <TrendingUp
              className={`h-6 w-6 ${result.passed || false ? "text-green-600" : "text-red-600"}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Review Answers Section */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <h2 className="mb-4 font-bold text-xl">Review Your Answers</h2>
          <p className="mb-6 text-muted-foreground">
            Check your answers and see explanations for each question
          </p>

          <div className="space-y-4">
            {result.answers.map((answer, index) => {
              const isExpanded = expandedQuestion === index;
              const question = quiz.quizData?.questions?.find(
                (q) => q.id === answer.questionId,
              );

              return (
                <Card
                  key={answer.questionId}
                  className="border border-border/50"
                >
                  <CardContent className="p-4">
                    <div
                      className="flex cursor-pointer items-start justify-between"
                      onClick={() => toggleQuestionExpansion(index)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Question {index + 1}:
                          </span>
                          <h3 className="text-foreground">
                            {question?.text || "Unknown question"}
                          </h3>
                        </div>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            {answer.isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span
                              className={`text-sm ${answer.isCorrect ? "text-green-600" : "text-red-600"}`}
                            >
                              {answer.isCorrect ? "Correct" : "Incorrect"}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Your answer:</span>{" "}
                            <span
                              className={
                                answer.isCorrect
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {getSelectedOptionText(
                                answer.questionId,
                                answer.selectedOptionId,
                                answer.question?.type,
                              )}
                            </span>
                          </div>
                          {!answer.isCorrect && (
                            <div className="text-sm">
                              <span className="font-medium">
                                Correct answer:
                              </span>{" "}
                              <span className="text-green-600">
                                {getCorrectOptionText(
                                  answer.questionId,
                                  answer.correctOptionId,
                                  answer.question?.type,
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button className="ml-2 p-1">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 border-border/50 border-t pt-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium">Explanation:</h4>
                            <p className="mt-1 text-muted-foreground">
                              {question?.explanation ||
                                "No explanation available"}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium">Options:</h4>
                            <div className="mt-2 space-y-2">
                              {question?.type === "FILL_BLANK" ||
                              question?.type === "FREE_RESPONSE" ? (
                                <div className="space-y-2">
                                  <div className="rounded-md bg-muted p-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        Your answer:
                                      </span>
                                      <span>
                                        {answer.selectedOptionId ||
                                          "No answer provided"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="rounded-md bg-green-100 p-2 dark:bg-green-900/30">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-green-600">
                                        Correct answer:
                                      </span>
                                      <span>
                                        {answer.correctOptionId ||
                                          "No correct answer defined"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                question?.options?.map((option) => {
                                  const isUserSelected =
                                    option.id === answer.selectedOptionId;
                                  const isCorrect =
                                    option.id === answer.correctOptionId;

                                  return (
                                    <div
                                      key={option.id}
                                      className={`rounded-md p-2 ${
                                        isUserSelected
                                          ? isCorrect
                                            ? "bg-green-100 dark:bg-green-900/30"
                                            : "bg-red-100 dark:bg-red-900/30"
                                          : isCorrect
                                            ? "bg-green-100 dark:bg-green-900/30"
                                            : "bg-muted"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {isUserSelected && (
                                          <span className="font-medium">
                                            {isCorrect
                                              ? "✓ Your answer"
                                              : "✗ Your answer"}
                                          </span>
                                        )}
                                        {isCorrect && !isUserSelected && (
                                          <span className="font-medium text-green-600">
                                            ✓ Correct answer
                                          </span>
                                        )}
                                        <span>{option.text}</span>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          onClick={onRetake}
          className="flex items-center gap-2"
          size="lg"
        >
          <RotateCcw className="h-4 w-4" />
          Retake Quiz
        </Button>

        <Button
          variant="outline"
          onClick={() => router.push("/quizzes")}
          className="flex items-center gap-2"
          size="lg"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quizzes
        </Button>
      </div>
    </div>
  );
}
