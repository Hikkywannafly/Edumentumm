"use client";

import TiptapEditor from "@/components/shared/editor/tiptap-editor";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils"; // hàm tiện ích merge class (có sẵn trong Shadcn)
import type { QuizQuestionProps } from "@/types/quiz-take";
import { CheckCircle, XCircle } from "lucide-react";

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
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === "incorrect")
      return <XCircle className="h-5 w-5 text-red-600" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="text-center">
        <TiptapEditor
          content={question.text}
          onChange={() => {}}
          showToolbar={false}
          className="tiptap-editor mb-4 font-semibold text-xl leading-relaxed"
        />
      </div>

      {/* Switch Mode Button */}
      <div className="flex justify-center">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-muted-foreground/30 bg-muted px-3 py-2 text-muted-foreground text-sm transition "
        >
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
        </button>
      </div>

      {/* Options */}
      <RadioGroup
        value={selectedOptionId}
        onValueChange={onAnswerChange}
        disabled={showResult || (mode === "QUIZ" && isAnswered)}
        className="space-y-3"
      >
        {question.options?.map((option, index) => {
          const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
          const status = getOptionStatus(option.id);

          return (
            <Label
              key={option.id}
              htmlFor={option.id}
              className={cn(
                "flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all",
                " hover: hover:text-accent-foreground",
                status === "correct" && "border-green-500 dark:bg-green-900/30",
                status === "incorrect" && "border-red-500 dark:bg-red-900/30",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded border-muted-foreground/40 bg-background font-medium text-muted-foreground text-sm",
                    selectedOptionId === option.id ? " " : "",
                  )}
                >
                  {optionLetter}.
                </div>
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  className="sr-only"
                />
              </div>

              <div className="flex-1">
                <TiptapEditor
                  content={option.text}
                  onChange={() => {}}
                  showToolbar={false}
                  className="tiptap-editor"
                />
              </div>

              {getOptionIcon(option.id)}
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
