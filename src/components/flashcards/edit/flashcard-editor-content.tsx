"use client";

import ThinLayout from "@/components/layout/thin-layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlashcardEdit } from "@/hooks/flashcard/use-flashcard-edit";
import { useFlashcardEditorStore } from "@/stores/flashcard-editor-store";
import type { FlashcardData } from "@/types/flashcard";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FlashcardCardsEditor } from "./flashcard-cards-editor";
import { FlashcardDescriptionEditor } from "./flashcard-description-editor";
import { FlashcardEditorHeader } from "./flashcard-editor-header";
import { FlashcardTitleEditor } from "./flashcard-title-editor";

interface FlashcardEditorContentProps {
  flashcardSetId: string;
}

export function FlashcardEditorContent({
  flashcardSetId,
}: FlashcardEditorContentProps) {
  const flashcardSetIdNumber = Number.parseInt(flashcardSetId, 10);

  // Use React Query hook for edit operations
  const {
    flashcardSet,
    isLoading,
    error,
    saveFlashcard,
    publishFlashcard,
    deleteFlashcardSet,
    isSaving,
    isDeleting,
  } = useFlashcardEdit(flashcardSetIdNumber);

  // Get metadata from store
  const { flashcardData } = useFlashcardEditorStore();

  // Local state for editing
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Initialize form data when flashcard set loads
  useEffect(() => {
    if (flashcardSet) {
      setTitle(flashcardSet.title);
      setDescription(flashcardSet.description);
      setFlashcards(flashcardSet.flashcards);
      setIsPublic(flashcardSet.isPublic);
    }
  }, [flashcardSet]);

  // Update form data when AI-generated title/description is available from store
  useEffect(() => {
    if (flashcardData?.title && flashcardData?.description) {
      // Only update if the current values are default/empty or we're in creation mode
      const isCreatingNew =
        !flashcardSet ||
        flashcardSet.title.includes("Generated") ||
        flashcardSet.title.includes("Flashcards");
      const hasDefaultTitle =
        title.includes("Generated") ||
        title.includes("Flashcards") ||
        title.trim() === "";

      if (isCreatingNew || hasDefaultTitle) {
        setTitle(flashcardData.title);
        setDescription(flashcardData.description);
      }
    }
  }, [flashcardData?.title, flashcardData?.description, flashcardSet, title]);

  // Load flashcards from store if available (for newly generated flashcards)
  useEffect(() => {
    if (flashcardData?.flashcards && flashcardData.flashcards.length > 0) {
      // Only load if we don't have flashcards yet or have default/empty ones
      const isCreatingNew =
        !flashcardSet || flashcardSet.flashcards.length === 0;
      const hasEmptyFlashcards = flashcards.length === 0;

      if (isCreatingNew || hasEmptyFlashcards) {
        setFlashcards(flashcardData.flashcards);
      }
    }
  }, [flashcardData?.flashcards, flashcardSet, flashcards.length]);

  const detectFlashcardType = (): "VOCABULARY" | "QUESTIONS" => {
    // 1. Detect from current editing flashcards first (highest priority)
    if (flashcards.length > 0) {
      const firstCard = flashcards[0];
      // Check if it has vocabulary-specific fields
      if ("vocabulary" in firstCard && "meaning" in firstCard) {
        return "VOCABULARY";
      }
      // Check if it has question-specific fields
      if ("question" in firstCard && "choices" in firstCard) {
        return "QUESTIONS";
      }
    }

    // 2. If no current flashcards, check the original flashcard set structure
    const flashcardSetFirstCard = flashcardSet?.flashcards?.[0];
    if (flashcardSetFirstCard) {
      if (
        "vocabulary" in flashcardSetFirstCard &&
        "meaning" in flashcardSetFirstCard
      ) {
        return "VOCABULARY";
      }
      if (
        "question" in flashcardSetFirstCard &&
        "choices" in flashcardSetFirstCard
      ) {
        return "QUESTIONS";
      }
    }

    // 3. Only use metadata as fallback for completely new flashcard sets
    if (
      flashcardData?.metadata?.flashcardType &&
      flashcards.length === 0 &&
      (!flashcardSet?.flashcards || flashcardSet.flashcards.length === 0)
    ) {
      return flashcardData.metadata.flashcardType;
    }

    // 4. Final fallback to QUESTIONS type
    return "QUESTIONS";
  };

  const addFlashcard = () => {
    const flashcardType = detectFlashcardType();

    const newFlashcard: FlashcardData =
      flashcardType === "VOCABULARY"
        ? {
            id: Date.now(),
            vocabulary: "Enter vocabulary word/phrase here",
            meaning: "Enter meaning here",
            example: "Enter example sentence here",
            explanation: "Enter additional explanation here",
          }
        : {
            id: Date.now(),
            question: "Enter your flashcard question here",
            choices: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0,
            explanation: "Enter explanation for the correct answer",
          };
    setFlashcards([...flashcards, newFlashcard]);
  };

  const addFlashcardAfter = (afterIndex: number) => {
    const flashcardType = detectFlashcardType();
    const newFlashcard: FlashcardData =
      flashcardType === "VOCABULARY"
        ? {
            id: Date.now() + Math.random(),
            vocabulary: "Enter vocabulary word/phrase here",
            meaning: "Enter meaning here",
            example: "Enter example sentence here",
            explanation: "Enter additional explanation here",
          }
        : {
            id: Date.now() + Math.random(),
            question: "Enter your flashcard question here",
            choices: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0,
            explanation: "Enter explanation for the correct answer",
          };

    const newFlashcards = [...flashcards];
    newFlashcards.splice(afterIndex + 1, 0, newFlashcard);
    setFlashcards(newFlashcards);
  };

  const updateFlashcard = (index: number, updatedFlashcard: FlashcardData) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index] = updatedFlashcard;
    setFlashcards(newFlashcards);
  };

  const deleteFlashcard = (index: number) => {
    setFlashcards(flashcards.filter((_, i) => i !== index));
  };

  const moveFlashcard = (fromIndex: number, toIndex: number) => {
    const newFlashcards = [...flashcards];
    const [removed] = newFlashcards.splice(fromIndex, 1);
    newFlashcards.splice(toIndex, 0, removed);
    setFlashcards(newFlashcards);
  };

  const handleSave = async () => {
    if (!flashcardSet) return;

    // Use the detectFlashcardType function for consistency
    const flashcardType = detectFlashcardType();

    try {
      const result = await saveFlashcard(
        title,
        description,
        flashcards,
        isPublic,
        flashcardData?.metadata?.categoryId || flashcardSet.categoryId,
        flashcardType,
      );
      console.log("✅ Flashcard set saved successfully", result);
    } catch (err) {
      console.error("❌ Error saving flashcard set:", err);
    }
  };

  const handlePublish = async () => {
    if (!flashcardSet) return;

    const flashcardType = detectFlashcardType();

    try {
      const result = await publishFlashcard(
        title,
        description,
        flashcards,
        isPublic,
        flashcardData?.metadata?.categoryId || flashcardSet.categoryId,
        flashcardType,
      );
      console.log("✅ Flashcard set published successfully", result);
    } catch (err) {
      console.error("❌ Error publishing flashcard set:", err);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!flashcardSet) return;

    try {
      setShowDeleteDialog(false);
      await deleteFlashcardSet();
      // Navigation is handled in the hook
    } catch (err) {
      console.error("❌ Error deleting flashcard set:", err);
    }
  };

  // Enhanced loading state with skeleton
  if (isLoading) {
    return (
      <ThinLayout>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>

          {/* Form skeletons */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* Cards skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-4 rounded-lg border p-4">
                <Skeleton className="h-8 w-full" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </ThinLayout>
    );
  }

  // Enhanced error state with retry
  if (error) {
    return (
      <ThinLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <h3 className="font-semibold text-lg">
                Error loading flashcard set
              </h3>
              <p className="text-red-600">{error.message}</p>
            </div>
          </div>
        </div>
      </ThinLayout>
    );
  }

  if (!flashcardSet) {
    return (
      <ThinLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">
            No flashcard set found. Please go back and try again.
          </div>
        </div>
      </ThinLayout>
    );
  }

  return (
    <ThinLayout>
      <div className="space-y-6">
        <FlashcardEditorHeader
          flashcardSet={flashcardSet}
          title={title}
          description={description}
          flashcards={flashcards}
          isPublic={isPublic}
          isSaving={isSaving || isDeleting}
          onAddFlashcard={addFlashcard}
          onSave={handleSave}
          onPublish={handlePublish}
          onDelete={handleDelete}
          onPrivacyChange={setIsPublic}
        />

        <div className="space-y-4">
          <FlashcardTitleEditor title={title} onTitleChange={setTitle} />

          <FlashcardDescriptionEditor
            description={description}
            onDescriptionChange={setDescription}
          />
        </div>

        <FlashcardCardsEditor
          flashcards={flashcards}
          onUpdateFlashcard={updateFlashcard}
          onDeleteFlashcard={deleteFlashcard}
          onMoveFlashcard={moveFlashcard}
          onAddFlashcard={addFlashcard}
          onAddFlashcardAfter={addFlashcardAfter}
        />
      </div>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flashcard Set</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this flashcard set? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ThinLayout>
  );
}
