"use client";

import { FlashcardCardsEditor } from "@/components/flashcards/edit/flashcard-cards-editor";
import { FlashcardDescriptionEditor } from "@/components/flashcards/edit/flashcard-description-editor";
import { FlashcardTitleEditor } from "@/components/flashcards/edit/flashcard-title-editor";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { flashcardService } from "@/lib/api/flashcard";
import type { CreateFlashcardSetRequest } from "@/lib/api/flashcard";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { useFlashcardEditorStore } from "@/stores/flashcard-editor-store";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function FlashcardEditorPage() {
  const { goFlashcards } = useLocalizedNavigation();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const {
    flashcardData,
    setEditing,
    updateFlashcardData,
    updateFlashcard,
    deleteFlashcard,
    moveFlashcard,
    addFlashcard,
  } = useFlashcardEditorStore();
  const t = useTranslations("Flashcards");

  const handleAddFlashcard = () => {
    const newFlashcard = {
      id: Date.now() + Math.random(), // More unique ID for new flashcard
      question: "Enter your flashcard question here",
      choices: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      explanation: "Enter explanation for the correct answer",
    };
    addFlashcard(newFlashcard);
  };

  const handleAddFlashcardAfter = (afterIndex: number) => {
    const newFlashcard = {
      id: Date.now() + Math.random(), // More unique ID for new flashcard
      question: "Enter your flashcard question here",
      choices: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      explanation: "Enter explanation for the correct answer",
    };
    // Use the store's addFlashcardAfter function
    const { addFlashcardAfter } = useFlashcardEditorStore.getState();
    addFlashcardAfter(afterIndex, newFlashcard);
  };

  const handleCreateFlashcard = async () => {
    if (!flashcardData) return;

    setIsSaving(true);

    try {
      // Validate required fields
      if (!flashcardData.title.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter a title for your flashcard set",
          variant: "destructive",
        });
        return;
      }

      if (flashcardData.flashcards.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please add at least one flashcard",
          variant: "destructive",
        });
        return;
      }

      // Validate each flashcard
      for (let i = 0; i < flashcardData.flashcards.length; i++) {
        const flashcard = flashcardData.flashcards[i];
        if (!flashcard.question.trim()) {
          toast({
            title: "Validation Error",
            description: `Please enter a question for flashcard ${i + 1}`,
            variant: "destructive",
          });
          return;
        }
        if (flashcard.choices.some((choice) => !choice.trim())) {
          toast({
            title: "Validation Error",
            description: `Please fill in all choices for flashcard ${i + 1}`,
            variant: "destructive",
          });
          return;
        }
      }

      const isUpdate = !!flashcardData.id;

      if (isUpdate) {
        // Update existing flashcard set
        const updateRequest = {
          title: flashcardData.title.trim(),
          description: flashcardData.description.trim(),
          isPublic: false, // Can be made configurable later
          flashcards: flashcardData.flashcards.map((flashcard) => ({
            id: flashcard.id as number,
            question: flashcard.question.trim(),
            choices: flashcard.choices.map((choice) => choice.trim()),
            correctAnswer: flashcard.correctAnswer,
            explanation: flashcard.explanation?.trim() || "",
          })),
        };

        const updatedFlashcardSet = await flashcardService.updateFlashcardSet(
          flashcardData.id as number,
          updateRequest,
        );

        console.log(
          "✅ Flashcard set updated successfully:",
          updatedFlashcardSet,
        );

        toast({
          title: "Success!",
          description: "Your flashcard set has been updated successfully",
        });
      } else {
        // Create new flashcard set
        const createRequest: CreateFlashcardSetRequest = {
          title: flashcardData.title.trim(),
          description: flashcardData.description.trim(),
          isPublic: false, // Default to private, can be made configurable later
          flashcards: flashcardData.flashcards.map((flashcard) => ({
            question: flashcard.question.trim(),
            choices: flashcard.choices.map((choice) => choice.trim()),
            correctAnswer: flashcard.correctAnswer,
            explanation: flashcard.explanation?.trim() || "",
          })),
        };

        const createdFlashcardSet =
          await flashcardService.createFlashcardSet(createRequest);

        console.log(
          "✅ Flashcard set created successfully:",
          createdFlashcardSet,
        );

        toast({
          title: "Success!",
          description: "Your flashcard set has been created successfully",
        });
      }

      // Clear editor state and navigate back
      setEditing(false);
      goFlashcards();
    } catch (error) {
      console.error("❌ Error saving flashcard set:", error);

      let errorMessage = "Failed to save flashcard set";

      // Handle different types of errors
      if (error instanceof Error) {
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (
          error.message.includes("401") ||
          error.message.includes("unauthorized")
        ) {
          errorMessage = "You need to be logged in to save flashcards.";
        } else if (
          error.message.includes("403") ||
          error.message.includes("forbidden")
        ) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (
          error.message.includes("400") ||
          error.message.includes("validation")
        ) {
          errorMessage = "Invalid data. Please check your flashcard content.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Save Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!flashcardData) {
    return (
      <DashboardLayout>
        <div className="flex h-full flex-col items-center justify-center">
          <p className="text-muted-foreground">No flashcard data found</p>
          <LocalizedLink href="/flashcards">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Flashcards
            </Button>
          </LocalizedLink>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col">
        <PageHeaderClient
          title={t("editPage.title")}
          action={
            <div className="flex items-center gap-4">
              <LocalizedLink href="/flashcards">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("editPage.backToFlashcards")}
                </Button>
              </LocalizedLink>
              <Button
                onClick={handleCreateFlashcard}
                disabled={!flashcardData || isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {flashcardData?.id
                      ? t("createCTA.updating")
                      : t("createCTA.saving")}
                  </>
                ) : flashcardData?.id ? (
                  t("editPage.updateChanges")
                ) : (
                  t("editPage.saveChanges")
                )}
              </Button>
            </div>
          }
        />
        <div className="flex-1 overflow-hidden">
          <div className="container mx-auto max-w-4xl p-6">
            <div className="space-y-6">
              <FlashcardTitleEditor
                title={flashcardData.title}
                onTitleChange={(title) => updateFlashcardData({ title })}
              />
              <FlashcardDescriptionEditor
                description={flashcardData.description}
                onDescriptionChange={(description) =>
                  updateFlashcardData({ description })
                }
              />
              <FlashcardCardsEditor
                flashcards={flashcardData.flashcards}
                onUpdateFlashcard={(_index, flashcard) =>
                  updateFlashcard(flashcard.id, flashcard)
                }
                onDeleteFlashcard={(index) => {
                  const flashcardToDelete = flashcardData.flashcards[index];
                  if (flashcardToDelete) {
                    deleteFlashcard(flashcardToDelete.id);
                  }
                }}
                onMoveFlashcard={moveFlashcard}
                onAddFlashcard={handleAddFlashcard}
                onAddFlashcardAfter={handleAddFlashcardAfter}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
