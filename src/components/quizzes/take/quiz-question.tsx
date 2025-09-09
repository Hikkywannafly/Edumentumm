"use client";

import TiptapEditor from "@/components/shared/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { QuizQuestionProps } from "@/types/quiz-take";
import { CheckCircle2, XCircle } from "lucide-react";

// Define types for better readability
type OptionStatus = "default" | "selected" | "correct" | "incorrect";

interface OptionStyleConfig {
  containerClasses: string;
  letterClasses: string;
}

export function QuizQuestion({
  question,
  selectedOptionId,
  onAnswerChange,
  showResult = false,
  correctOptionId,
  mode = "QUIZ",
  isAnswered = false,
}: QuizQuestionProps) {
  const getOptionStatus = (optionId: string): OptionStatus => {
    if (!showResult) {
      return optionId === selectedOptionId ? "selected" : "default";
    }

    if (optionId === correctOptionId) return "correct";
    if (optionId === selectedOptionId && optionId !== correctOptionId)
      return "incorrect";
    return "default";
  };

  const getStatusIcon = (status: OptionStatus) => {
    switch (status) {
      case "correct":
        return (
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        );
      case "incorrect":
        return <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />;
      default:
        return null;
    }
  };

  const getOptionStyle = (status: OptionStatus): OptionStyleConfig => {
    switch (status) {
      case "default":
        return {
          containerClasses: "bg-muted/40 hover:bg-muted/60",
          letterClasses: "border-muted-foreground/30 text-muted-foreground",
        };
      case "selected":
        return {
          containerClasses: "bg-muted/30 ring-1 ring-primary/40",
          letterClasses: "border-muted-foreground/30 text-primary",
        };
      case "correct":
        return {
          containerClasses:
            "bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-100",
          letterClasses:
            "border-emerald-500 text-emerald-900 dark:text-emerald-100",
        };
      case "incorrect":
        return {
          containerClasses:
            "bg-rose-50 text-rose-900 ring-2 ring-rose-500 dark:bg-rose-900/30 dark:text-rose-100",
          letterClasses: "border-rose-500 text-rose-900 dark:text-rose-100",
        };
      default:
        return {
          containerClasses: "",
          letterClasses: "",
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <TiptapEditor
          content={question.text}
          onChange={() => {}}
          showToolbar={false}
          className="mb-4 font-semibold text-xl leading-relaxed"
        />
      </div>

      <div className="flex justify-center">
        <Button variant="outline" size="sm" className="gap-2 rounded-2xl">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Switch to Type mode
        </Button>
      </div>

      {/* Options */}
      <RadioGroup
        value={selectedOptionId}
        onValueChange={onAnswerChange}
        disabled={showResult || (mode === "QUIZ" && isAnswered)}
        className="space-y-3 md:space-y-4"
      >
        {question.options?.map((option, index) => {
          const letter = String.fromCharCode(65 + index);
          const status = getOptionStatus(option.id);
          const icon = getStatusIcon(status);
          const { containerClasses, letterClasses } = getOptionStyle(status);

          return (
            <Label
              key={option.id}
              htmlFor={option.id}
              className={cn(
                "relative inline-flex w-full select-none items-center justify-start rounded-2xl p-2 font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] sm:text-base md:text-lg lg:text-xl",
                containerClasses,
              )}
            >
              <div className="mr-3 flex items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md font-semibold text-sm",
                    letterClasses,
                  )}
                >
                  {letter}.
                </div>
                <RadioGroupItem
                  id={option.id}
                  value={option.id}
                  className="sr-only"
                />
              </div>

              <div className="flex-1 rounded-xl px-2 py-1">
                <TiptapEditor
                  content={option.text}
                  onChange={() => {}}
                  showToolbar={false}
                  className={`max-w-none text-left text-sm md:text-lg ${containerClasses}`}
                />
              </div>

              {icon && (
                <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-4">
                  {icon}
                </span>
              )}
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
