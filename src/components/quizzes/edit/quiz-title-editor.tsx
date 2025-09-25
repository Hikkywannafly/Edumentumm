"use client";

import TiptapEditor from "@/components/shared/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

interface QuizTitleEditorProps {
  title: string;
  onTitleChange: (title: string) => void;
  onGenerateAITitle?: () => Promise<void>;
  isGenerating?: boolean;
}

export function QuizTitleEditor({
  title,
  onTitleChange,
  onGenerateAITitle,
  isGenerating = false,
}: QuizTitleEditorProps) {
  const [isLocalGenerating, setIsLocalGenerating] = useState(false);

  const handleGenerateAI = async () => {
    if (!onGenerateAITitle || isGenerating || isLocalGenerating) return;

    setIsLocalGenerating(true);
    try {
      await onGenerateAITitle();
    } finally {
      setIsLocalGenerating(false);
    }
  };

  const showGenerateButton = !!onGenerateAITitle;
  const isButtonLoading = isGenerating || isLocalGenerating;
  return (
    <Card className="border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quiz Title</CardTitle>
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
        <div className="items-start gap-2 rounded-md border border-gray-200 transition-all duration-200 hover:border-gray-300">
          <TiptapEditor
            content={title}
            onChange={onTitleChange}
            placeholder="Enter quiz title"
            showToolbar={true}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
