"use client";

import FlashcardCard from "@/components/shared/editor/flashcard-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FlashcardData } from "@/types/flashcard";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface FlashcardCardsEditorProps {
  flashcards: FlashcardData[];
  onUpdateFlashcard: (index: number, flashcard: FlashcardData) => void;
  onDeleteFlashcard: (index: number) => void;
  onMoveFlashcard: (fromIndex: number, toIndex: number) => void;
  onAddFlashcard?: () => void;
  onAddFlashcardAfter?: (afterIndex: number) => void;
}

export function FlashcardCardsEditor({
  flashcards,
  onUpdateFlashcard,
  onDeleteFlashcard,
  onMoveFlashcard,
  onAddFlashcard,
  onAddFlashcardAfter,
}: FlashcardCardsEditorProps) {
  const handleAddFlashcardAfter = (afterIndex: number) => {
    // This will add a new flashcard after the specified index
    if (onAddFlashcardAfter) {
      onAddFlashcardAfter(afterIndex);
    } else if (onAddFlashcard) {
      // Fallback to adding at the end
      onAddFlashcard();
    }
  };

  const t = useTranslations("Flashcards");

  return (
    <Card className="border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {t("title")} ({flashcards.length})
          </CardTitle>
          {onAddFlashcard && (
            <Button onClick={onAddFlashcard} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("editPage.addFlashcard")}
            </Button>
          )}
        </div>
      </CardHeader>

      {flashcards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No flashcards yet. Click "Add Flashcard" to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <CardContent className="space-y-6">
            {flashcards.map((flashcard, index) => (
              <FlashcardCard
                key={flashcard.id}
                flashcard={flashcard}
                flashcardIndex={index}
                onUpdate={(updatedFlashcard) =>
                  onUpdateFlashcard(index, updatedFlashcard)
                }
                onDelete={(_id) => onDeleteFlashcard(index)}
                onMoveUp={(_id) => onMoveFlashcard(index, index - 1)}
                onMoveDown={(_id) => onMoveFlashcard(index, index + 1)}
                onAddFlashcard={handleAddFlashcardAfter}
                canMoveUp={index > 0}
                canMoveDown={index < flashcards.length - 1}
              />
            ))}
          </CardContent>
        </div>
      )}
    </Card>
  );
}
