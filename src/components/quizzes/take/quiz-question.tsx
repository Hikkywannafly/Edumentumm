"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { QuizQuestionProps } from "@/types/quiz-take";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export function QuizQuestion({
  question,
  selectedOptionId,
  onAnswerChange,
  showResult = false,
  correctOptionId,
  mode = "QUIZ",
  isAnswered = false,
}: QuizQuestionProps) {
  const getOptionStatus = (optionId: string) => {
    if (!showResult) return "default";

    if (optionId === correctOptionId) return "correct";
    if (optionId === selectedOptionId && optionId !== correctOptionId)
      return "incorrect";
    return "default";
  };

  const getOptionIcon = (optionId: string) => {
    if (!showResult) return null;

    const status = getOptionStatus(optionId);
    if (status === "correct")
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === "incorrect")
      return <XCircle className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getOptionClassName = (optionId: string) => {
    if (!showResult)
      return "hover:bg-muted/50 cursor-pointer transition-colors";

    const status = getOptionStatus(optionId);
    if (status === "correct")
      return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
    if (status === "incorrect")
      return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
    return "";
  };

  return (
    <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        {/* Question Text */}
        <div className="mb-6">
          <h2 className="mb-3 font-semibold text-foreground text-lg leading-tight">
            {question.text}
          </h2>

          {/* Question Meta */}
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <Badge variant="outline" className="text-xs">
              {question.type.replace("_", " ")}
            </Badge>
            <span>
              {question.points} {question.points === 1 ? "point" : "points"}
            </span>
          </div>
        </div>

        {/* Options */}
        <RadioGroup
          value={selectedOptionId}
          onValueChange={onAnswerChange}
          disabled={showResult || (mode === "QUIZ" && isAnswered)}
          className="space-y-3"
        >
          {question.options?.map((option) => (
            <div
              key={option.id}
              className={`rounded-lg border p-4 transition-all ${getOptionClassName(option.id)}`}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  className="flex-shrink-0"
                  disabled={showResult || (mode === "QUIZ" && isAnswered)}
                />
                <Label
                  htmlFor={option.id}
                  className="flex-1 cursor-pointer text-sm leading-relaxed"
                >
                  {option.text}
                </Label>
                {getOptionIcon(option.id)}
              </div>
            </div>
          ))}
        </RadioGroup>

        {/* Explanation (shown in result mode) */}
        {showResult && question.explanation && (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <div>
                <p className="mb-1 font-medium text-blue-900 text-sm dark:text-blue-100">
                  Explanation
                </p>
                <p className="text-blue-800 text-sm leading-relaxed dark:text-blue-200">
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
