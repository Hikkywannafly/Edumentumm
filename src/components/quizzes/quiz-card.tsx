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
import type { QuizCardProps } from "@/types/quiz-display";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Edit,
  Eye,
  MoreVertical,
  Trash2,
  Users,
} from "lucide-react";

export function QuizCard({ quiz, onDelete, onEdit, onView }: QuizCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "HARD":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700";
    }
  };

  const handleView = () => {
    if (onView) {
      onView(quiz);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(quiz);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(quiz.id);
    }
  };

  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:bg-card hover:shadow-black/5 hover:shadow-lg dark:hover:shadow-black/20">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <h3 className="line-clamp-2 font-semibold text-foreground text-lg leading-tight">
              {quiz.title}
            </h3>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className={`${getDifficultyColor(quiz.difficulty)} font-medium text-xs`}
                >
                  {quiz.difficulty}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{quiz.totalQuestions} questions</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{quiz.estimatedTime}m</span>
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
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4" />
                View Quiz
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Quiz
              </DropdownMenuItem>
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

        {/* Status & Privacy Indicators */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Users className="h-3.5 w-3.5" />
            <span>{quiz.attemptCount} attempts</span>
          </div>
        </div>

        {quiz.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1.5">
            {quiz.tags.slice(0, 2).map((tag, index) => {
              // Handle both string tags and tag objects
              const tagName =
                typeof tag === "string"
                  ? tag
                  : (tag as any)?.name || String(tag);
              return (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-muted font-normal text-muted-foreground text-xs hover:bg-muted/80"
                >
                  {String(tagName)}
                </Badge>
              );
            })}
            {quiz.tags.length > 2 && (
              <Badge
                variant="secondary"
                className="bg-muted font-normal text-muted-foreground text-xs"
              >
                +{quiz.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-center gap-2 font-medium hover:bg-muted"
            asChild
          >
            <LocalizedLink href={`quizzes/${quiz.slug}-${quiz.id}/edit`}>
              <Edit className="h-4 w-4" />
              Edit
            </LocalizedLink>
          </Button>
          <Button
            size="sm"
            className="flex-1 transform justify-center gap-2 bg-blue-600 font-medium text-white duration-200 hover:bg-blue-700 active:scale-95"
            asChild
          >
            <LocalizedLink href={`quizzes/${quiz.slug}-${quiz.id}`}>
              <ArrowRight className="h-4 w-4" />
              Take Quiz
            </LocalizedLink>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
