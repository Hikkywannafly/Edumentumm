"use client";

import { ErrorBoundary } from "react-error-boundary";
import { FlashcardErrorFallback } from "./flashcard-error-boundary";
import { FlashcardsContent } from "./flashcards-content";

export function FlashcardsPageWithErrorBoundary() {
  return (
    <ErrorBoundary
      FallbackComponent={FlashcardErrorFallback}
      onReset={() => {
        // Optional: Add logging or analytics here
        console.log("Flashcard error boundary reset");
      }}
    >
      <FlashcardsContent />
    </ErrorBoundary>
  );
}
