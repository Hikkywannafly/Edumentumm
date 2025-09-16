"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { BackendQuizEntity } from "@/types/quiz";
import type { QuizResult } from "@/types/quiz-take";
import { useState } from "react";
import { QuestionItem } from "./question-item";

interface AnswerReviewSectionProps {
  result: QuizResult;
  quiz: BackendQuizEntity;
}

export function AnswerReviewSection({
  result,
  quiz,
}: AnswerReviewSectionProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const toggleQuestionExpansion = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const getSelectedOptionText = (
    questionId: string,
    selectedOptionId: string,
    questionType?: string,
  ) => {
    const question = quiz.quizData?.questions?.find(
      (q: any) => q.id === questionId,
    );

    // For text-based questions, return the actual text answer
    if (questionType === "FILL_BLANK" || questionType === "FREE_RESPONSE") {
      return selectedOptionId || "No answer provided";
    }

    const option = question?.options?.find(
      (opt: any) => opt.id === selectedOptionId,
    );
    return option ? option.text : "No answer selected";
  };

  const getCorrectOptionText = (
    questionId: string,
    correctOptionId: string,
    questionType?: string,
  ) => {
    const question = quiz.quizData?.questions?.find(
      (q: any) => q.id === questionId,
    );

    // For text-based questions, return the correct answer text
    if (questionType === "FILL_BLANK" || questionType === "FREE_RESPONSE") {
      return correctOptionId || "No correct answer defined";
    }

    // For multiple choice questions, find the option text
    const option = question?.options?.find(
      (opt: any) => opt.id === correctOptionId,
    );
    return option ? option.text : "Unknown";
  };

  return (
    <Card className="rounded-xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm">
      <CardContent className="p-6">
        <h2 className="mb-2 font-bold text-2xl text-foreground">
          Review Your Answers
        </h2>
        <p className="mb-6 text-muted-foreground">
          Check your answers and see explanations for each question
        </p>

        <div className="space-y-4">
          {result.answers.map((answer, index) => {
            const isExpanded = expandedQuestion === index;
            const question = quiz.quizData?.questions?.find(
              (q: any) => q.id === answer.questionId,
            );

            return (
              <QuestionItem
                key={answer.questionId}
                answer={answer}
                question={question}
                index={index}
                isExpanded={isExpanded}
                onToggleExpansion={() => toggleQuestionExpansion(index)}
                getSelectedOptionText={getSelectedOptionText}
                getCorrectOptionText={getCorrectOptionText}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
