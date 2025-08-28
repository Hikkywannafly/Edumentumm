"use client";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlashcardStudy } from "@/hooks/flashcard/use-flashcard-study";
import { AlertCircle, Loader2 } from "lucide-react";
import ThinLayout from "../../layout/thin-layout";
import { FlashcardNavigator } from "./flashcard-navigator";

interface FlashcardStudyViewProps {
  flashcardSetId: number;
}

export function FlashcardStudyView({
  flashcardSetId,
}: FlashcardStudyViewProps) {
  // Use enhanced React Query hook for study view
  const {
    data: flashcardSet,
    isLoading,
    error,
    refetch,
    hasFlashcards,
  } = useFlashcardStudy(flashcardSetId);

  // Loading state with enhanced skeleton
  if (isLoading) {
    return (
      <ThinLayout classNames="flex-1 p-6">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Flashcard skeleton */}
          <div className="mx-auto max-w-2xl">
            <div className="aspect-[3/2] rounded-lg border-2 border-dashed p-8">
              <div className="flex h-full flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <Skeleton className="h-6 w-48" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </ThinLayout>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <ThinLayout classNames="flex-1 p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 font-semibold text-lg">
            Error loading flashcard set
          </h3>
          <p className="mb-4 text-center text-muted-foreground">
            {error.message || "Failed to load flashcard set"}
          </p>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
            <LocalizedLink href="/flashcards">
              <Button>Back to Flashcards</Button>
            </LocalizedLink>
          </div>
        </div>
      </ThinLayout>
    );
  }

  if (!flashcardSet || !hasFlashcards) {
    return (
      <ThinLayout classNames="flex-1 p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="mb-4 h-12 w-12 text-yellow-500" />
          <h3 className="mb-2 font-semibold text-lg">
            {!flashcardSet ? "Flashcard set not found" : "No flashcards found"}
          </h3>
          <p className="mb-4 text-center text-muted-foreground">
            {!flashcardSet
              ? "The requested flashcard set could not be found."
              : "This flashcard set doesn't contain any cards yet."}
          </p>
          <LocalizedLink href="/flashcards">
            <Button>Back to Flashcards</Button>
          </LocalizedLink>
        </div>
      </ThinLayout>
    );
  }

  return (
    <ThinLayout classNames="flex-1 space-y-6 p-6">
      <FlashcardNavigator flashcardSet={flashcardSet} />
    </ThinLayout>
  );
}
