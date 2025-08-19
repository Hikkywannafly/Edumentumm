"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FlashcardData } from "@/types/flashcard";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import TiptapEditor from "./tiptap-editor";

interface FlashcardCardProps {
  flashcard: FlashcardData;
  onUpdate: (updatedFlashcard: FlashcardData) => void;
  onDelete: (id: number) => void;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  onAddFlashcard?: (afterIndex: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  flashcardIndex: number;
}

export default function FlashcardCard({
  flashcard,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddFlashcard,
  canMoveUp,
  canMoveDown,
  flashcardIndex,
}: FlashcardCardProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(true);

  const t = useTranslations("Flashcards");

  const handleQuestionChange = (html: string) => {
    onUpdate({ ...flashcard, question: html });
  };

  const handleChoiceChange = (choiceIndex: number, value: string) => {
    const updatedChoices = [...flashcard.choices];
    updatedChoices[choiceIndex] = value;
    onUpdate({ ...flashcard, choices: updatedChoices });
  };

  const handleAddChoice = () => {
    const choiceNumber = flashcard.choices.length + 1;
    const updatedChoices = [...flashcard.choices, `Choice ${choiceNumber}`];
    onUpdate({ ...flashcard, choices: updatedChoices });
  };

  const handleDeleteChoice = (choiceIndex: number) => {
    const updatedChoices = flashcard.choices.filter(
      (_, index) => index !== choiceIndex,
    );
    // Adjust correctAnswer if necessary
    let newCorrectAnswer = flashcard.correctAnswer;
    if (choiceIndex === flashcard.correctAnswer) {
      newCorrectAnswer = 0; // Reset to first choice
    } else if (choiceIndex < flashcard.correctAnswer) {
      newCorrectAnswer = flashcard.correctAnswer - 1;
    }

    onUpdate({
      ...flashcard,
      choices: updatedChoices,
      correctAnswer: newCorrectAnswer,
    });
  };

  const handleCorrectAnswerChange = (value: string) => {
    const choiceIndex = Number.parseInt(value);
    onUpdate({ ...flashcard, correctAnswer: choiceIndex });
  };

  const handleExplanationChange = (html: string) => {
    onUpdate({ ...flashcard, explanation: html });
  };

  return (
    <div>
      <Card className="mb-6 border">
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="font-medium text-gray-700 text-md">
                Flashcard {flashcardIndex + 1}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={handleAddChoice}
                className="whitespace-nowrap"
              >
                <Plus className="mr-2 h-4 w-4" /> {t("editPage.addChoice")}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="whitespace-nowrap"
              >
                <Settings className="mr-2 h-4 w-4" />
                {t("editPage.advanced")}
              </Button>

              {/* Actions */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(flashcard.id)}
                className="ml-1"
                aria-label="Delete flashcard"
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
              <div
                className="flex cursor-grab items-center justify-center text-gray-400"
                title="Drag to reorder"
              >
                <GripVertical className="h-5 w-5" />
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onMoveUp(flashcard.id)}
                  disabled={!canMoveUp}
                  title="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onMoveDown(flashcard.id)}
                  disabled={!canMoveDown}
                  title="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Question Editor */}
          <div className="mb-6 w-full">
            <Label
              htmlFor="question"
              className="mb-2 block font-medium text-sm"
            >
              {t("editPage.question")}
            </Label>
            <TiptapEditor
              content={flashcard.question}
              onChange={handleQuestionChange}
              placeholder="Enter your flashcard question here..."
              showToolbar={true}
            />
          </div>

          {/* Multiple Choice Answers */}
          <div className="mb-2">
            <Label htmlFor="choices" className="mb-3 block font-medium text-sm">
              {t("editPage.answerChoices")}
            </Label>
            <RadioGroup
              value={flashcard.correctAnswer.toString()}
              onValueChange={handleCorrectAnswerChange}
              className="grid gap-4"
            >
              {flashcard.choices.map((choice, index) => {
                const isCorrect = index === flashcard.correctAnswer;
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2 rounded-md border p-3 transition-all duration-200 ${
                      isCorrect
                        ? "border-green-500 bg-green-100 shadow-sm dark:border-green-400 dark:bg-green-900/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                    }`}
                  >
                    <RadioGroupItem
                      value={index.toString()}
                      id={`choice-${index}`}
                      className="mt-4"
                    />
                    <div className="relative flex flex-1 items-center gap-2">
                      <div className="flex-1">
                        <TiptapEditor
                          content={choice}
                          onChange={(html) => handleChoiceChange(index, html)}
                          placeholder={`Choice ${index + 1}`}
                          showToolbar={true}
                          className={`w-full ${isCorrect ? "border-none bg-green-100 dark:bg-green-900/30" : ""}`}
                        />
                      </div>
                      {isCorrect && (
                        <div className="-right-1 absolute flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white shadow-sm dark:bg-green-400 dark:text-gray-900">
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    {flashcard.choices.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteChoice(index)}
                        className="mt-2"
                        title="Delete choice"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Advanced Settings */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleContent className="mt-4 space-y-4 border-t pt-4">
              {/* Explanation */}
              <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                    <svg
                      className="h-3.5 w-3.5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <Label
                    htmlFor="explanation"
                    className="bg-emerald-50/50 font-medium text-sm"
                  >
                    {t("editPage.explanation")}
                  </Label>
                </div>
                <div className="rounded-md border-emerald-200 bg-white">
                  <TiptapEditor
                    content={flashcard.explanation || ""}
                    onChange={handleExplanationChange}
                    placeholder="Explain why this answer is correct..."
                    showToolbar={true}
                    className="min-h-[100px] border-none bg-blue-50"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
      {onAddFlashcard && (
        <div className="group relative my-4">
          <div className="absolute top-1/2 w-full border-gray-100 border-t dark:border-gray-700" />

          <div className="flex justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddFlashcard(flashcardIndex)}
              className="relative z-10 bg-white px-3 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-900"
            >
              <Plus className="mr-1 h-4 w-4" />
              {t("editPage.addFlashcard")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
