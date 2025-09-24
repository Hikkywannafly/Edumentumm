"use client";

import { LocalizedLink } from "@/components/localized-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { QuizCardProps } from "@/types/quiz-display";
import {
  ArrowRight,
  Dot,
  Edit,
  FileCheck2,
  MoreVertical,
  Trash2,
  TrendingUp,
} from "lucide-react";

export function QuizCard({ quiz, onDelete }: QuizCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
      case "HARD":
        return "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/50";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700/50";
    }
  };

  const formatBestScore = () => {
    const attemptCount = quiz.attemptCount || 0;
    const bestCorrectAnswers =
      quiz.bestCorrectAnswers !== undefined
        ? quiz.bestCorrectAnswers
        : undefined;
    const totalQuestions = quiz.totalQuestions || 0;

    if (
      attemptCount > 0 &&
      bestCorrectAnswers !== undefined &&
      totalQuestions > 0
    ) {
      const bestScore = Math.round((bestCorrectAnswers / totalQuestions) * 100);
      return `Best: ${bestScore}% (${attemptCount} ${attemptCount === 1 ? "attempt" : "attempts"})`;
    }
    if (attemptCount === 0) {
      return "Not attempted yet";
    }

    return `(${attemptCount} ${attemptCount === 1 ? "attempt" : "attempts"})`;
  };

  const handleDelete = () => {
    onDelete?.(quiz.id);
  };

  const renderKeywords = () => {
    if (quiz.keywords.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5">
          {quiz.keywords.slice(0, 3).map((keyword, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className="max-w-[120px] cursor-default truncate bg-muted/40 px-2 py-0.5 font-normal text-muted-foreground text-xs hover:bg-muted/60"
                >
                  {keyword}
                </Badge>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="border bg-popover px-2.5 py-1.5 text-popover-foreground text-xs shadow-sm"
              >
                <p>{keyword}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {quiz.keywords.length > 3 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className="cursor-pointer bg-tran px-2 py-0.5 font-normal text-muted-foreground text-xs hover:bg-muted/60"
                >
                  +{quiz.keywords.length - 3} more
                </Badge>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-xs border border-border/80 bg-popover p-2 text-popover-foreground shadow-lg"
              >
                <div className="grid grid-cols-1 gap-1.5">
                  {quiz.keywords.slice(3).map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="justify-start truncate bg-muted/50 px-2 py-0.5 font-normal text-muted-foreground text-xs"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    );
  };

  const renderPerformanceStats = () => {
    // Always render the performance stats section for consistency
    return (
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 flex-shrink-0 text-muted-foreground/70" />
        <span className="text-muted-foreground text-sm">
          {formatBestScore()}
        </span>
      </div>
    );
  };

  const renderActionButtons = () => (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 justify-center gap-2 font-medium text-xs hover:bg-muted"
        asChild
      >
        <LocalizedLink href={`quizzes/${quiz.slug}-${quiz.id}/edit`}>
          <Edit className="h-4 w-4" />
          <span className="hidden sm:inline">Edit</span>
          <span className="sm:hidden">Edit</span>
        </LocalizedLink>
      </Button>

      {quiz.attemptCount > 0 && (
        <Button
          variant="secondary"
          size="sm"
          className="h-8 justify-center gap-2 font-medium text-xs"
          asChild
        >
          <LocalizedLink href={`quizzes/${quiz.slug}-${quiz.id}/results`}>
            <FileCheck2 className="h-4 w-4" />
            <span className="hidden sm:inline">View Results</span>
            <span className="sm:hidden">Results</span>
          </LocalizedLink>
        </Button>
      )}
      <Button
        size="sm"
        className="h-8 justify-center gap-2 bg-blue-600 font-medium text-white text-xs hover:bg-blue-700"
        asChild
      >
        <LocalizedLink href={`quizzes/${quiz.slug}-${quiz.id}`}>
          <ArrowRight className="h-4 w-4" />
          <span className="hidden sm:inline">Take Quiz</span>
          <span className="sm:hidden">Take</span>
        </LocalizedLink>
      </Button>
    </div>
  );

  const formatTimeDisplay = () => {
    const now = new Date();
    const createdAt = new Date(quiz.createdAt);
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      return createdAt.toLocaleDateString();
    }

    // Show relative time
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    }

    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours > 0) {
      return `${diffHours}h ago`;
    }

    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    }

    return "Just now";
  };

  return (
    <Card className="group relative h-full overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:bg-card hover:shadow-black/5 hover:shadow-sm dark:hover:shadow-black/20">
      <CardContent className="flex h-full flex-col p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <h3 className="line-clamp-2 text-start font-semibold text-foreground text-lg leading-tight">
              {quiz.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={`${getDifficultyColor(
                  quiz.difficulty,
                )} rounded-sm border-none px-2 py-0.5 font-medium text-xs`}
              >
                {quiz.difficulty}
              </Badge>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Dot className="h-5 w-5" />
                <span>{quiz.totalQuestions} questions</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Dot className="h-5 w-5" />
                <span>{formatTimeDisplay()}</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 transition-opacity duration-200 hover:bg-muted group-hover:opacity-100"
                aria-label="Quiz options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {renderPerformanceStats()}
        {renderKeywords()}
        <div className="mt-auto">{renderActionButtons()}</div>
      </CardContent>
    </Card>
  );
}
