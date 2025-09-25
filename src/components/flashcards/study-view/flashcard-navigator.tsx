"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { htmlToText } from "@/lib/utils/text";
import type { FlashcardSet } from "@/types/flashcard";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import WideContainer from "../../layout/wide-layout";
import { FlipCard } from "./flip-card";

interface FlashcardNavigatorProps {
  flashcardSet: FlashcardSet;
}

export function FlashcardNavigator({ flashcardSet }: FlashcardNavigatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentFlashcard = flashcardSet.flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcardSet.flashcards.length) * 100;

  const handleNext = () => {
    if (currentIndex < flashcardSet.flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  return (
    <WideContainer classNames="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-bold text-2xl">
            {htmlToText(flashcardSet.title)}
          </h1>
          <p className="text-muted-foreground">
            {htmlToText(flashcardSet.description)}
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Card {currentIndex + 1} of {flashcardSet.flashcards.length}
            </CardTitle>
            <Button
              variant="ghost"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
      </Card>

      {/* Flashcard with Navigation */}
      <div className="relative mx-auto max-w-4xl">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="-translate-y-1/2 -left-20 absolute top-1/2 h-12 w-12"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Flashcard */}
        <div className="flex justify-center">
          <FlipCard
            key={currentIndex}
            flashcard={currentFlashcard}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === flashcardSet.flashcards.length - 1}
          className="-translate-y-1/2 -right-20 absolute top-1/2 h-12 w-12"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </WideContainer>
  );
}
