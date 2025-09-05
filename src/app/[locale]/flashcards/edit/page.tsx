"use client";

import { FlashcardCardsEditor } from "@/components/flashcards/edit/flashcard-cards-editor";
import { FlashcardCategoryEditor } from "@/components/flashcards/edit/flashcard-category-editor";
import { FlashcardDescriptionEditor } from "@/components/flashcards/edit/flashcard-description-editor";
import { FlashcardTitleEditor } from "@/components/flashcards/edit/flashcard-title-editor";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { useFlashcardEditor } from "@/hooks/flashcard/use-flashcard-editor";
import { useFlashcardEditorStore } from "@/stores/flashcard-editor-store";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function FlashcardEditorPage() {
  const { flashcardData, isSaving, saveFlashcard } = useFlashcardEditor();

  const {
    updateFlashcardData,
    updateFlashcard: updateFlashcardInStore,
    deleteFlashcard,
    moveFlashcard,
    addFlashcard,
  } = useFlashcardEditorStore();

  const t = useTranslations("Flashcards");

  const handleAddFlashcard = () => {
    // Determine flashcard type from existing flashcards or metadata
    let flashcardType: "VOCABULARY" | "QUESTIONS" = "QUESTIONS";

    if (flashcardData?.metadata?.flashcardType) {
      // Use metadata if available
      flashcardType = flashcardData.metadata.flashcardType;
    } else if (
      flashcardData?.flashcards &&
      flashcardData.flashcards.length > 0
    ) {
      // Detect type from existing flashcards by checking if any has vocabulary fields
      const hasVocabularyFields = flashcardData.flashcards.some(
        (card) => card.vocabulary !== undefined || card.meaning !== undefined,
      );
      flashcardType = hasVocabularyFields ? "VOCABULARY" : "QUESTIONS";
    }

    const newFlashcard =
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
    addFlashcard(newFlashcard);
  };

  const handleAddFlashcardAfter = (afterIndex: number) => {
    // Determine flashcard type from existing flashcards or metadata
    let flashcardType: "VOCABULARY" | "QUESTIONS" = "QUESTIONS";

    if (flashcardData?.metadata?.flashcardType) {
      // Use metadata if available
      flashcardType = flashcardData.metadata.flashcardType;
    } else if (
      flashcardData?.flashcards &&
      flashcardData.flashcards.length > 0
    ) {
      // Detect type from existing flashcards by checking if any has vocabulary fields
      const hasVocabularyFields = flashcardData.flashcards.some(
        (card) => card.vocabulary !== undefined || card.meaning !== undefined,
      );
      flashcardType = hasVocabularyFields ? "VOCABULARY" : "QUESTIONS";
    }

    const newFlashcard =
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
    // Use the store's addFlashcardAfter function
    const { addFlashcardAfter } = useFlashcardEditorStore.getState();
    addFlashcardAfter(afterIndex, newFlashcard);
  };

  const handleCreateFlashcard = () => {
    saveFlashcard();
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
              <FlashcardCategoryEditor
                categoryId={flashcardData.metadata?.categoryId}
                onCategoryChange={(categoryId) =>
                  updateFlashcardData({
                    metadata: {
                      total_cards: flashcardData.flashcards.length,
                      ...flashcardData.metadata,
                      categoryId,
                    },
                  })
                }
              />
              <FlashcardCardsEditor
                flashcards={flashcardData.flashcards}
                onUpdateFlashcard={(_index, flashcard) =>
                  updateFlashcardInStore(flashcard.id, flashcard)
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
