"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BackendQuizEntity } from "@/types/quiz";
import type { QuizResult } from "@/types/quiz-take";
import { BookOpen, CheckCircle, CircleX } from "lucide-react";
import { QuestionItem } from "../question-item";

interface AnswerReviewSectionProps {
  result: QuizResult;
  quiz: BackendQuizEntity;
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

export function AnswerReviewSection({
  result,
  quiz,
  getSelectedOptionText,
  getCorrectOptionText,
}: AnswerReviewSectionProps) {
  return (
    <Card className="rounded-xl bg-card/50 backdrop-blur-sm">
      <CardHeader className="p-6">
        <CardTitle className="font-semibold text-lg">Review Answers</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <BookOpen className="size-4" />
              <span>All ({result.answers.length})</span>
            </TabsTrigger>
            <TabsTrigger value="correct" className="flex items-center gap-2">
              <CheckCircle className="size-4 text-green-500" />
              <span>Correct ({result.correctAnswers})</span>
            </TabsTrigger>
            <TabsTrigger value="incorrect" className="flex items-center gap-2">
              <CircleX className="size-4 text-red-500" />
              <span>
                Incorrect ({result.totalQuestions - result.correctAnswers})
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Accordion type="single" collapsible className="space-y-2">
              {result.answers.map((answer, index) => {
                const question = quiz.quizData?.questions?.find(
                  (q: any) => q.id === answer.questionId,
                );

                return (
                  <AccordionItem
                    key={answer.questionId}
                    value={`question-${index}`}
                    className="rounded-lg border"
                  >
                    <AccordionTrigger className="rounded-lg bg-secondary/50 px-4 py-4 hover:no-underline">
                      <div className="flex w-full items-center gap-4">
                        {answer.isCorrect ? (
                          <CheckCircle className="!text-green-500 shrink-0" />
                        ) : (
                          <CircleX className="shrink-0 text-red-500" />
                        )}
                        <div className="prose prose-sm md:prose-lg !md:prose-sm !prose-sm block max-w-none text-start">
                          <p>{question?.text || "Unknown question"}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="border-border/50 border-t p-4">
                      <QuestionItem
                        answer={answer}
                        question={question}
                        index={index}
                        isExpanded={true}
                        onToggleExpansion={() => {}}
                        getSelectedOptionText={getSelectedOptionText}
                        getCorrectOptionText={getCorrectOptionText}
                      />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>

          <TabsContent value="correct" className="mt-4">
            <Accordion type="single" collapsible className="space-y-2">
              {result.answers
                .filter((a) => a.isCorrect)
                .map((answer, index) => {
                  const question = quiz.quizData?.questions?.find(
                    (q: any) => q.id === answer.questionId,
                  );

                  return (
                    <AccordionItem
                      key={answer.questionId}
                      value={`question-${index}`}
                      className="rounded-lg border"
                    >
                      <AccordionTrigger className="rounded-lg bg-secondary/50 px-4 py-4 hover:no-underline">
                        <div className="flex w-full items-center gap-4">
                          <CheckCircle className="!text-green-500 shrink-0" />
                          <div className="prose prose-sm md:prose-lg !md:prose-sm !prose-sm block max-w-none text-start">
                            <p>{question?.text || "Unknown question"}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="border-border/50 border-t p-4">
                        <QuestionItem
                          answer={answer}
                          question={question}
                          index={index}
                          isExpanded={true}
                          onToggleExpansion={() => {}}
                          getSelectedOptionText={getSelectedOptionText}
                          getCorrectOptionText={getCorrectOptionText}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
            </Accordion>
          </TabsContent>

          <TabsContent value="incorrect" className="mt-4">
            <Accordion type="single" collapsible className="space-y-2">
              {result.answers
                .filter((a) => !a.isCorrect)
                .map((answer, index) => {
                  const question = quiz.quizData?.questions?.find(
                    (q: any) => q.id === answer.questionId,
                  );

                  return (
                    <AccordionItem
                      key={answer.questionId}
                      value={`question-${index}`}
                      className="rounded-lg border"
                    >
                      <AccordionTrigger className="rounded-lg bg-secondary/50 px-4 py-4 hover:no-underline">
                        <div className="flex w-full items-center gap-4">
                          <CircleX className="shrink-0 text-red-500" />
                          <div className="prose prose-sm md:prose-lg !md:prose-sm !prose-sm block max-w-none text-start">
                            <p>{question?.text || "Unknown question"}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="border-border/50 border-t p-4">
                        <QuestionItem
                          answer={answer}
                          question={question}
                          index={index}
                          isExpanded={true}
                          onToggleExpansion={() => {}}
                          getSelectedOptionText={getSelectedOptionText}
                          getCorrectOptionText={getCorrectOptionText}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
            </Accordion>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
