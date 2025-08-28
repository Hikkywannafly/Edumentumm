"use client";

import { ErrorBoundary } from "react-error-boundary";
import { FlashcardErrorFallback } from "../flashcard-error-boundary";
import { FlashcardEditorContent } from "./flashcard-editor-content";

interface FlashcardEditorWrapperProps {
  flashcardSetId: string;
}

export function FlashcardEditorWrapper({
  flashcardSetId,
}: FlashcardEditorWrapperProps) {
  return (
    <ErrorBoundary
      FallbackComponent={FlashcardErrorFallback}
      resetKeys={[flashcardSetId]} // Reset error boundary when ID changes
      onReset={() => {
        // Optional: Clear any cached data when error boundary resets
        console.log("Error boundary reset for flashcard editor");
      }}
    >
      <FlashcardEditorContent flashcardSetId={flashcardSetId} />
    </ErrorBoundary>
  );
}
