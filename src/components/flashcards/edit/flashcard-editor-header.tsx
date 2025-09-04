"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { htmlToText } from "@/lib/utils/text";
import type { FlashcardData, FlashcardSet } from "@/types/flashcard";
import { CheckCircle, Globe, Loader2, Lock, Save, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { CardHeader, CardTitle } from "../../ui";

interface FlashcardEditorHeaderProps {
  flashcardSet: FlashcardSet;
  title: string;
  description: string;
  flashcards: FlashcardData[];
  isPublic: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  onPublish?: () => void;
  onDelete?: () => void;
  onAddFlashcard?: () => void;
  onPrivacyChange?: (isPublic: boolean) => void;
}

export function FlashcardEditorHeader({
  flashcardSet,
  title,
  description,
  flashcards,
  isPublic,
  isSaving = false,
  onSave,
  onPublish,
  onDelete,
  onPrivacyChange,
}: FlashcardEditorHeaderProps) {
  const t = useTranslations("Flashcards");

  // Deep comparison function for flashcards
  const flashcardsHaveChanged = () => {
    if (flashcards.length !== flashcardSet.flashcards.length) {
      return true;
    }

    return flashcards.some((flashcard, index) => {
      const original = flashcardSet.flashcards[index];
      if (!original) return true;

      // Check if it's vocabulary type flashcard
      if (flashcard.vocabulary && flashcard.meaning) {
        return (
          flashcard.vocabulary !== original.vocabulary ||
          flashcard.meaning !== original.meaning ||
          flashcard.example !== original.example ||
          flashcard.explanation !== original.explanation
        );
      }

      // Check if it's question type flashcard
      if (flashcard.question && flashcard.choices) {
        return (
          flashcard.question !== original.question ||
          flashcard.explanation !== original.explanation ||
          flashcard.correctAnswer !== original.correctAnswer ||
          (flashcard.choices?.length || 0) !==
            (original.choices?.length || 0) ||
          flashcard.choices?.some(
            (choice, choiceIndex) => choice !== original.choices?.[choiceIndex],
          )
        );
      }

      // Fallback comparison for any other type
      return (
        flashcard.question !== original.question ||
        flashcard.vocabulary !== original.vocabulary ||
        flashcard.meaning !== original.meaning ||
        flashcard.example !== original.example ||
        flashcard.explanation !== original.explanation ||
        flashcard.correctAnswer !== original.correctAnswer
      );
    });
  };

  const hasChanges =
    htmlToText(title) !== htmlToText(flashcardSet.title) ||
    htmlToText(description) !== htmlToText(flashcardSet.description) ||
    isPublic !== flashcardSet.isPublic ||
    flashcardsHaveChanged();

  const canSave = hasChanges && htmlToText(title).trim() !== "";
  const canPublish = canSave && flashcards.length > 0;

  return (
    <div className="sticky top-0 z-10 m-6 border-rounded bg-background shadow-sm">
      <div className="container mx-auto max-w-6xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col">
            <CardTitle>{t("editPage.title")}</CardTitle>
            <div className="flex items-center gap-4 pt-4 text-muted-foreground text-sm">
              <span>
                {flashcards.length} {t("flashcardCard.cards")}
              </span>
              <Select
                value={isPublic ? "public" : "private"}
                onValueChange={(value) => onPrivacyChange?.(value === "public")}
              >
                <SelectTrigger className="h-auto w-auto border-rounded bg-transparent p-2 text-sm">
                  <SelectValue>
                    <div className="flex items-center gap-1">
                      {isPublic ? (
                        <Globe className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      {isPublic
                        ? t("create.settings.public")
                        : t("create.settings.private")}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-3 w-3" />
                      {t("create.settings.private")}
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      {t("create.settings.public")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              onClick={onDelete}
              disabled={isSaving}
              className="flex items-center gap-2 bg-red-500 text-white transition-colors duration-200 hover:bg-red-600 hover:text-white dark:bg-red-500 dark:hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4" />
              {t("editPage.deleteFlashcard")}
            </Button>
            <Button
              variant="outline"
              onClick={onSave}
              disabled={!canSave || isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t("editPage.saveDraft")}
            </Button>
            <Button
              onClick={onPublish}
              disabled={!canPublish || isSaving}
              className="flex items-center gap-2 bg-blue-500 text-white transition-colors duration-200 hover:bg-blue-600 hover:text-white dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {t("editPage.saveChanges")}
            </Button>
          </div>
        </CardHeader>
      </div>
    </div>
  );
}
