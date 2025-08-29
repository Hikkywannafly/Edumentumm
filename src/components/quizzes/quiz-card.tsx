"use client";

import { LocalizedLink } from "@/components/localized-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { QuizCardProps } from "@/types/quiz-display";
import {
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
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HARD":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-orange-100 text-orange-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <CardTitle className="line-clamp-2 font-semibold text-lg">
              {quiz.title}
            </CardTitle>
            <p className="line-clamp-2 text-muted-foreground text-sm">
              {quiz.description}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={getDifficultyColor(quiz.difficulty)}
          >
            {quiz.difficulty}
          </Badge>
          <Badge variant="outline" className={getStatusColor(quiz.status)}>
            {quiz.status}
          </Badge>
          {quiz.visibility === "PRIVATE" && (
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              Private
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-4 grid grid-cols-3 gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{quiz.totalQuestions} questions</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{quiz.estimatedTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{quiz.attemptCount} attempts</span>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1">
          {quiz.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {quiz.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{quiz.tags.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <LocalizedLink href={`quizzes/${quiz.slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </LocalizedLink>
          <LocalizedLink href={`quizzes/${quiz.slug}/edit`} className="flex-1">
            <Button size="sm" className="w-full">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </LocalizedLink>
        </div>
      </CardContent>
    </Card>
  );
}
