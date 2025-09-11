"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { QuizResultProps } from "@/types/quiz-take";
import {
  ArrowLeft,
  Award,
  CheckCircle,
  Clock,
  RotateCcw,
  Target,
  TrendingUp,
  Trophy,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function QuizResult({ result, quiz, onRetake }: QuizResultProps) {
  const router = useRouter();
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Clock className="mx-auto mb-3 h-8 w-8 text-purple-600" />
            <div className="font-bold text-2xl text-foreground">
              {formatTime(result.timeSpent || 0)}
            </div>
            <p className="text-muted-foreground text-sm">Time Spent</p>
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
