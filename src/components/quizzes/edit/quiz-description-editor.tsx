"use client";

import TiptapEditor from "@/components/shared/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface QuizDescriptionEditorProps {
  description: string;
  onDescriptionChange: (description: string) => void;
  onGenerateAIDescription?: () => Promise<void>;
  isGenerating?: boolean;
}

export function QuizDescriptionEditor({
  description,
  onDescriptionChange,
  onGenerateAIDescription,
  isGenerating = false,
}: QuizDescriptionEditorProps) {
  const t = useTranslations("Quizzes.edit");
  const [isLocalGenerating, setIsLocalGenerating] = useState(false);

  const handleGenerateAI = async () => {
    if (!onGenerateAIDescription || isGenerating || isLocalGenerating) return;

    setIsLocalGenerating(true);
    try {
      await onGenerateAIDescription();
    } finally {
      setIsLocalGenerating(false);
    }
  };

  const showGenerateButton = !!onGenerateAIDescription;
  const isButtonLoading = isGenerating || isLocalGenerating;

  return (
    <Card className="border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("quizDescription")}</CardTitle>
          {showGenerateButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateAI}
              disabled={isButtonLoading}
              className="gap-2"
            >
              {isButtonLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className=" items-start gap-2 rounded-md border border-gray-200 transition-all duration-200 hover:border-gray-300">
          <TiptapEditor
            content={description}
            onChange={onDescriptionChange}
            placeholder={t("quizDescription")}
            showToolbar={true}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
