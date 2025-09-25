"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BackendQuestion } from "@/types/quiz";
import type { QuizResult } from "@/types/quiz-take";
import { CheckCircle, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import { useMemo } from "react";

interface QuestionItemProps {
  answer: QuizResult["answers"][0];
  question: BackendQuestion | undefined;
  index: number;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  getSelectedOptionText: (
    questionId: string,
    selectedOptionId: string,
    questionType?: string,
  ) => string;
  getCorrectOptionText: (
    questionId: string,
    correctOptionId: string,
    questionType?: string,
  ) => string;
}

export function QuestionItem({
  answer,
  question,
  index,
  isExpanded,
  onToggleExpansion,
  getSelectedOptionText,
  getCorrectOptionText,
}: QuestionItemProps) {
  // Memoize the text for selected and correct answers to avoid recalculation
  const selectedAnswerText = useMemo(
    () =>
      getSelectedOptionText(
        answer.questionId,
        answer.selectedOptionId,
        answer.question?.type,
      ),
    [
      answer.questionId,
      answer.selectedOptionId,
      answer.question?.type,
      getSelectedOptionText,
    ],
  );

  const correctAnswerText = useMemo(
    () =>
      getCorrectOptionText(
        answer.questionId,
        answer.correctOptionId,
        answer.question?.type,
      ),
    [
      answer.questionId,
      answer.correctOptionId,
      answer.question?.type,
      getCorrectOptionText,
    ],
  );

  // Determine if this is a text-based question
  const isTextBasedQuestion = useMemo(
    () => question?.type === "FILL_BLANK" || question?.type === "FREE_RESPONSE",
    [question?.type],
  );

  // Check if the selected answer matches any option
  const isSelectedAnswerMatchingOption = useMemo(
    () =>
      question?.options &&
      answer.selectedOptionId &&
      question.options.some((opt) => opt.id === answer.selectedOptionId),
    [question?.options, answer.selectedOptionId],
  );

  return (
    <Card className="rounded-xl border border-border/50 transition-all">
      <CardContent className="p-4">
        <div
          className="flex cursor-pointer items-start justify-between"
          onClick={onToggleExpansion}
        >
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-primary">
                Question {index + 1}:
              </span>
              <h3 className="font-medium text-foreground">
                {question?.text || "Unknown question"}
              </h3>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                {answer.isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span
                  className={`font-medium ${answer.isCorrect ? "text-green-600" : "text-red-600"}`}
                >
                  {answer.isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">
                  Your answer:
                </span>{" "}
                <span
                  className={`font-medium ${answer.isCorrect ? "text-green-600" : "text-red-600"}`}
                >
                  {selectedAnswerText}
                </span>
              </div>
              {!answer.isCorrect && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">
                    Correct answer:
                  </span>{" "}
                  <span className="font-medium text-green-600">
                    {correctAnswerText}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button className="ml-2 rounded-full p-2" variant="ghost">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 border-border/50 border-t pt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-muted-foreground">
                  Explanation:
                </h4>
                <p className="mt-1 text-foreground">
                  {question?.explanation || "No explanation available"}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-muted-foreground">Options:</h4>
                <div className="mt-3 space-y-3">
                  {isTextBasedQuestion ? (
                    <div className="space-y-3">
                      <div className="rounded-lg bg-muted p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-muted-foreground">
                            Your answer:
                          </span>
                          <span className="font-medium">
                            {selectedAnswerText}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-lg bg-green-100 p-4 dark:bg-green-900/30">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-600">
                            Correct answer:
                          </span>
                          <span className="font-medium">
                            {correctAnswerText}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    question?.options?.map((option) => {
                      const isUserSelected =
                        option.id === answer.selectedOptionId;
                      const isCorrect = option.id === answer.correctOptionId;

                      return (
                        <div
                          key={option.id}
                          className={`rounded-lg p-4 ${
                            isUserSelected
                              ? isCorrect
                                ? "border border-green-200 bg-green-100 dark:border-green-800 dark:bg-green-900/30"
                                : "border border-red-200 bg-red-100 dark:border-red-800 dark:bg-red-900/30"
                              : isCorrect
                                ? "border border-green-200 bg-green-100 dark:border-green-800 dark:bg-green-900/30"
                                : "border border-border bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isUserSelected && (
                              <span className="font-bold">
                                {isCorrect ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600" />
                                )}
                              </span>
                            )}
                            {isCorrect && !isUserSelected && (
                              <span className="font-bold text-green-600">
                                <CheckCircle className="h-5 w-5" />
                              </span>
                            )}
                            <span className="font-medium">{option.text}</span>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Show the actual selected answer if it doesn't match any option */}
                  {!isSelectedAnswerMatchingOption &&
                    answer.selectedOptionId && (
                      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-yellow-600">
                            Selected (not matching options):
                          </span>
                          <span className="font-medium">
                            {answer.selectedOptionId}
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
