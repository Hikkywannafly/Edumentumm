"use client";

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
    <div className="">
      <div className="p-8">
        {/* Question Text */}
        <div className="mb-8 text-center">
          <h2 className="mb-6 font-medium text-gray-900 text-xl leading-relaxed dark:text-white">
            {question.text}
          </h2>
        </div>

        {/* Type Mode Switcher (for display purposes) */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
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
          </div>
        </div>

        {/* Options */}
        <RadioGroup
          value={selectedOptionId}
          onValueChange={onAnswerChange}
          disabled={showResult || (mode === "QUIZ" && isAnswered)}
          className="space-y-4"
        >
          {question.options?.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
            return (
              <div
                key={option.id}
                className={`group rounded-lg border-2 p-4 transition-all hover:border-gray-300 dark:hover:border-gray-600 ${
                  selectedOptionId === option.id
                    ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                    : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                } ${getOptionClassName(option.id)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded border font-medium text-sm ${
                        selectedOptionId === option.id
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {optionLetter}
                    </div>
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="sr-only"
                      disabled={showResult || (mode === "QUIZ" && isAnswered)}
                    />
                  </div>
                  <Label
                    htmlFor={option.id}
                    className="flex-1 cursor-pointer text-gray-900 text-sm leading-relaxed dark:text-white"
                  >
                    {option.text}
                  </Label>
                  {getOptionIcon(option.id)}
                </div>
              </div>
            );
          })}
        </RadioGroup>

        {/* Explanation (shown in result mode) */}
        {showResult && question.explanation && (
          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
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
      </div>
    </div>
  );
}
