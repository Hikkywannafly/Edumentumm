"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFileProcessor } from "@/hooks/use-file-processor";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import { Loader2, Type } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface TextContentUploaderProps {
  onProcessingStart?: (fileName: string, label?: string) => void;
  onProcessingDone?: (done: boolean) => void;
}

export function TextContentUploader({
  onProcessingStart,
  onProcessingDone,
}: TextContentUploaderProps) {
  const t = useTranslations("Quizzes");
  const { goQuizEdit } = useLocalizedNavigation();
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [textContent, setTextContent] = useState("");

  const { extractQuestionsFromText, isProcessing } = useFileProcessor();
  const { setEditing } = useQuizEditorStore();

  const isBusy = isCreatingQuiz || isProcessing;

  useEffect(() => {
    if (isInitialMount) setIsInitialMount(false);
  }, [isInitialMount]);

  const handleCreateQuiz = async () => {
    if (isBusy) return;
    setIsCreatingQuiz(true);

    onProcessingStart?.(
      "Text Content",
      t("create.textContent.extractingQuestions"),
    );

    try {
      await extractQuestionsFromText(textContent, {
        language: "AUTO",
        parsingMode: "BALANCED",
      });

      onProcessingDone?.(true);
      setEditing(true);
      goQuizEdit();
    } catch (error) {
      console.error("Error creating quiz from text:", error);
      setIsCreatingQuiz(false);
      onProcessingDone?.(false);
    }
  };

  const handleClearContent = () => {
    setTextContent("");
  };

  const handlePasteContent = async () => {
    try {
      const clipboardContent = await navigator.clipboard.readText();
      setTextContent(clipboardContent);
    } catch (error) {
      console.error("Failed to read clipboard:", error);
    }
  };

  return (
    <div
      className={`space-y-6 border-none ${isBusy ? "pointer-events-none opacity-60" : ""}`}
    >
      <Card className="border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 border-none">
            <Type className="h-5 w-5" />
            {t("create.textContent.title")}
          </CardTitle>
          <CardDescription>
            {t("create.textContent.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="border-none">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-content">
                {t("create.textContent.title")}
              </Label>
              <Textarea
                id="text-content"
                placeholder={t("create.textContent.placeholder")}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="min-h-[300px] resize-none"
                disabled={isBusy}
              />
            </div>
            <div className="flex items-center justify-between text-muted-foreground text-sm">
              <span>{textContent.length} characters</span>
              <span>
                {textContent.split("\n").filter((line) => line.trim()).length}{" "}
                lines
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePasteContent}
                disabled={isBusy}
              >
                {t("create.textContent.pasteContent")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearContent}
                disabled={!textContent.trim() || isBusy}
              >
                {t("create.textContent.clearContent")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {t("create.textContent.guidance")}
        </p>
        <div className="flex gap-2">
          <Button
            disabled={!textContent.trim() || isBusy}
            onClick={handleCreateQuiz}
            className="flex items-center gap-2"
          >
            {isCreatingQuiz ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("create.textContent.extractingQuestions")}
              </>
            ) : (
              <>{t("create.textContent.extractQuestions")}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
