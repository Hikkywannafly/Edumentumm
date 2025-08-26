"use client";

import { ErrorBoundary } from "react-error-boundary";
import { FlashcardErrorFallback } from "../flashcard-error-boundary";
import { FlashcardStudyView } from "./flashcard-study-view";

interface FlashcardStudyViewWrapperProps {
  flashcardSetId: number;
}

export function FlashcardStudyViewWrapper({
  flashcardSetId,
}: FlashcardStudyViewWrapperProps) {
  return (
    <ErrorBoundary
      FallbackComponent={FlashcardErrorFallback}
      resetKeys={[flashcardSetId]} // Reset error boundary when ID changes
      onReset={() => {
        // Optional: Clear any cached data when error boundary resets
        console.log("Error boundary reset for flashcard study view");
      }}
    >
      <FlashcardStudyView flashcardSetId={flashcardSetId} />
    </ErrorBoundary>
  );
}
