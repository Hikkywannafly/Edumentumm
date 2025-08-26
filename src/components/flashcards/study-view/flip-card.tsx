"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { htmlToText } from "@/lib/utils/text";
import type { FlashcardData } from "@/types/flashcard";
import { CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FlipCardProps {
  flashcard: FlashcardData;
  onAnswer?: (isCorrect: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function FlipCard({ flashcard, onNext, onPrevious }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          onPrevious?.();
          break;
        case "ArrowRight":
          event.preventDefault();
          onNext?.();
          break;
        case " ":
          event.preventDefault();
          setIsFlipped(!isFlipped);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, onNext, onPrevious]);

  // Mouse swipe handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (startX === null) return;

    const endX = e.clientX;
    const deltaX = endX - startX;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        // Swipe right -> Previous
        onPrevious?.();
      } else {
        // Swipe left -> Next
        onNext?.();
      }
    }

    setStartX(null);
  };

  const handleMouseLeave = () => {
    setStartX(null);
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const getChoiceLetter = (index: number) => String.fromCharCode(65 + index);

  if (isFlipped) {
    // Back Side - Correct Answer & Explanation
    return (
      <div ref={cardRef} className="perspective-1000 h-auto w-full max-w-5xl">
        <Card
          className="h-full cursor-pointer select-none shadow-lg transition-transform duration-500"
          onClick={handleCardClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <CardContent className="flex h-full min-h-[400px] flex-col justify-between p-4">
            <div className="space-y-6">
              <div className="text-center">
                <p className="mb-2 text-muted-foreground text-sm">Question:</p>
                <h3 className="font-medium text-lg leading-relaxed">
                  {htmlToText(flashcard.question)}
                </h3>
              </div>

              <div className="space-y-4">
                {/* Correct Answer */}
                <div className="rounded-lg border border-green-200 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">
                      Correct Answer
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="default"
                      className="h-8 w-8 rounded-full bg-green-600 p-0 font-bold text-sm"
                    >
                      {getChoiceLetter(flashcard.correctAnswer)}
                    </Badge>
                    <span className="font-medium text-green-600 text-lg">
                      {htmlToText(flashcard.choices[flashcard.correctAnswer])}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                {flashcard.explanation && (
                  <div className="rounded-lg border border-blue-200 p-4">
                    <h4 className="mb-2 font-semibold">Explanation</h4>
                    <p className="leading-relaxed">
                      {htmlToText(flashcard.explanation)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="mt-6 text-muted-foreground text-xs">
                Click card to flip back
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Front Side - Question & Choices
  return (
    <div ref={cardRef} className="perspective-1000 h-auto w-full max-w-5xl">
      <Card
        className="h-full cursor-pointer select-none shadow-lg transition-transform duration-500"
        onClick={handleCardClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <CardContent className="flex h-full min-h-[400px] flex-col justify-between p-4">
          <div className="space-y-6">
            <div className="text-center">
              <p className="mb-2 text-muted-foreground text-sm">Question:</p>
              <h3 className="font-semibold text-xl leading-relaxed">
                {htmlToText(flashcard.question)}
              </h3>
            </div>

            <div className="space-y-4">
              {flashcard.choices.map((choice, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg p-4"
                >
                  <Badge
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0 font-bold text-sm"
                  >
                    {getChoiceLetter(index)}
                  </Badge>
                  <span className="font-medium text-lg">
                    {htmlToText(choice)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-muted-foreground text-xs">
              Click card to see answer
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
