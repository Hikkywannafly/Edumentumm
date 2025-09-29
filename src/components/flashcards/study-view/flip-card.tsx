"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { htmlToText } from "@/lib/utils/text";
import type { FlashcardData } from "@/types/flashcard";
import { CheckCircle, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HtmlViewer } from "../../shared/editor/html-viewer";

interface FlipCardProps {
  flashcard: FlashcardData;
  onAnswer?: (isCorrect: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function FlipCard({ flashcard, onNext, onPrevious }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Text-to-speech function
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice properties
      utterance.rate = 0.8; // Slower rate for better pronunciation
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to use English voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(
        (voice) => voice.lang.startsWith("en-") || voice.lang.startsWith("en_"),
      );
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      // Event handlers
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your browser");
    }
  };

  const handleSpeakVocabulary = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    const vocabularyText = htmlToText(flashcard.vocabulary || "");

    // Remove text in parentheses (e.g., part of speech like "(n)", "(v)", "(adj)")
    const cleanedText = vocabularyText.replace(/\s*\([^)]*\)/g, "").trim();

    if (cleanedText) {
      speakText(cleanedText);
    }
  };

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

  // Load speech synthesis voices
  useEffect(() => {
    if ("speechSynthesis" in window) {
      // Load voices when they become available
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };

      loadVoices();

      // Some browsers load voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

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

  // Determine flashcard type
  const isVocabularyType = !!(flashcard.vocabulary && flashcard.meaning);
  const isQuestionType = !!(flashcard.question && flashcard.choices);

  if (isFlipped) {
    // Back Side - Different content based on type
    return (
      <div ref={cardRef} className="perspective-1000 h-auto w-full max-w-5xl">
        <Card
          className="relative h-full cursor-pointer select-none shadow-lg transition-transform duration-500"
          onClick={handleCardClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <CardContent className="flex h-full min-h-[400px] flex-col p-4 pb-12">
            <div className="flex-1 space-y-6">
              {isVocabularyType ? (
                // Vocabulary Type Back Side
                <>
                  <div className="text-center">
                    <p className="mb-2 text-muted-foreground text-sm">
                      Vocabulary:
                    </p>
                    <h3 className="font-medium text-4xl leading-relaxed">
                      {htmlToText(flashcard.vocabulary || "")}
                    </h3>
                  </div>

                  <div className="space-y-4 text-left">
                    {/* Meaning */}
                    <div className="rounded-lg border border-blue-200 p-4">
                      <h4 className="mb-2 font-semibold text-blue-800">
                        Meaning
                      </h4>
                      <p className="text-blue-600 leading-relaxed">
                        {htmlToText(flashcard.meaning || "")}
                      </p>
                    </div>

                    {/* Example */}
                    {flashcard.example && (
                      <div className="rounded-lg border border-green-200 p-4">
                        <h4 className="mb-2 font-semibold text-green-800">
                          Example
                        </h4>
                        <p className="text-green-600 leading-relaxed">
                          {htmlToText(flashcard.example)}
                        </p>
                      </div>
                    )}

                    {/* Explanation */}
                    {flashcard.explanation && (
                      <div className="rounded-lg border border-purple-200 p-4">
                        <h4 className="mb-2 font-semibold text-purple-800">
                          Explanation
                        </h4>
                        <p className="text-purple-600 leading-relaxed">
                          {htmlToText(flashcard.explanation)}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : isQuestionType ? (
                // Question Type Back Side
                <>
                  <div className="text-center">
                    <p className="mb-2 text-muted-foreground text-sm">
                      Question:
                    </p>
                    <h3 className="font-medium text-lg leading-relaxed">
                      {htmlToText(flashcard.question || "")}
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
                          {getChoiceLetter(flashcard.correctAnswer || 0)}
                        </Badge>
                        <span className="font-medium text-green-600 text-lg">
                          {htmlToText(
                            flashcard.choices?.[flashcard.correctAnswer || 0] ||
                              "",
                          )}
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
                </>
              ) : (
                // Fallback for unknown type
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Unknown flashcard type
                  </p>
                </div>
              )}
            </div>

            <div className="absolute right-0 bottom-4 left-0 flex items-center justify-center">
              <div className="mt-6 text-muted-foreground text-xs">
                Click card to flip back
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Front Side - Different content based on type
  return (
    <div ref={cardRef} className="perspective-1000 h-auto w-full max-w-5xl">
      <Card
        className="relative h-full cursor-pointer select-none shadow-lg transition-transform duration-500"
        onClick={handleCardClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <CardContent className="relative flex h-full min-h-[400px] flex-col p-4 pb-12">
          <div className="flex flex-1 flex-col justify-center">
            {isVocabularyType ? (
              // Vocabulary Type Front Side
              <div className="relative flex flex-col items-center justify-center gap-20 text-center">
                {/* Audio button in top right corner */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSpeakVocabulary}
                  disabled={isSpeaking}
                  className="absolute top-0 right-0 flex h-12 w-12 items-center justify-center rounded-full hover:bg-blue-100"
                  title="Listen to pronunciation"
                >
                  <Volume2
                    className={`h-6 w-6 ${isSpeaking ? "animate-pulse text-blue-600" : "text-gray-600"}`}
                  />
                </Button>

                <p className="text-muted-foreground text-sm">Vocabulary:</p>
                <div className="flex items-center justify-center">
                  <HtmlViewer
                    content={flashcard.vocabulary || ""}
                    className="font-semibold text-6xl leading-relaxed"
                  />
                </div>
                <p className="text-muted-foreground text-sm">
                  What does this word mean?
                </p>
              </div>
            ) : isQuestionType ? (
              // Question Type Front Side
              <>
                <div className="text-center">
                  <p className="mb-2 text-muted-foreground text-sm">
                    Question:
                  </p>
                  <HtmlViewer
                    content={flashcard.question || ""}
                    className="font-semibold text-xl leading-relaxed"
                  />
                </div>

                <div className="space-y-4">
                  {(flashcard.choices || []).map((choice, index) => (
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
              </>
            ) : (
              // Fallback for unknown type
              <div className="text-center">
                <p className="text-muted-foreground">Unknown flashcard type</p>
              </div>
            )}
          </div>

          <div className="absolute right-0 bottom-4 left-0 flex items-center justify-center">
            <div className="text-muted-foreground text-xs">
              Click card to see answer
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
