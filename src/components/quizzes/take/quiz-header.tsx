"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { QuizHeaderProps } from "@/types/quiz-take";
import { BookOpen, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export function QuizHeader({
  title,
  currentQuestion,
  totalQuestions,
  timeSpent,
  estimatedTime,
}: QuizHeaderProps) {
  const [displayTime, setDisplayTime] = useState(timeSpent);

  useEffect(() => {
    setDisplayTime(timeSpent);
  }, [timeSpent]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (!estimatedTime) return "text-muted-foreground";

    const estimatedSeconds = estimatedTime * 60;
    const percentageUsed = (timeSpent / estimatedSeconds) * 100;

    if (percentageUsed > 90) return "text-red-600";
    if (percentageUsed > 75) return "text-amber-600";
    return "text-muted-foreground";
  };

  return (
    <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          {/* Quiz Title and Progress */}
          <div className="space-y-2">
            <h1 className="font-semibold text-foreground text-xl leading-tight">
              {title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>
                  Question {currentQuestion + 1} of {totalQuestions}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%
                Complete
              </Badge>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className={`h-4 w-4 ${getTimeColor()}`} />
              <span className={getTimeColor()}>{formatTime(displayTime)}</span>
              {estimatedTime && (
                <span className="text-muted-foreground">
                  / {estimatedTime}m
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
