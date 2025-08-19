"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload } from "lucide-react";

interface QuizEditorHeaderProps {
  onCreateQuiz: () => void;
  onBack?: () => void;
  canCreate: boolean;
  isCreating?: boolean;
}

export function QuizEditorHeader({
  onCreateQuiz,
  onBack,
  canCreate,
  isCreating = false,
}: QuizEditorHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between p-4">
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}

      {/* Right side - Create button */}
      <div className="flex gap-2 border-gray-200 border-b pb-2">
        <Button
          onClick={onCreateQuiz}
          disabled={!canCreate || isCreating}
          size="lg"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isCreating ? "Creating..." : "Create Quiz"}
        </Button>
      </div>
    </div>
  );
}
