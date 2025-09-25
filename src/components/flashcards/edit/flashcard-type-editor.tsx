"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FlashcardTypeEditorProps {
  flashcardType?: "QUESTIONS" | "VOCABULARY";
  onFlashcardTypeChange: (flashcardType: "QUESTIONS" | "VOCABULARY") => void;
}

export function FlashcardTypeEditor({
  flashcardType,
  onFlashcardTypeChange,
}: FlashcardTypeEditorProps) {
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Flashcard Type
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="font-medium text-sm">
            Choose the type of flashcards to optimize the learning experience
          </Label>

          <Select
            value={flashcardType}
            onValueChange={(value: "QUESTIONS" | "VOCABULARY") =>
              onFlashcardTypeChange(value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select flashcard type..." />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem value="QUESTIONS">❓ Questions</SelectItem>
              <SelectItem value="VOCABULARY">📚 Vocabulary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
