"use client";

import ThinLayout from "@/components/layout/thin-layout";
import {} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { FileText, Sparkles, Type } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AIGeneratedUploader } from "./ai-generated-uploader";
import { FileWithAnswersUploader } from "./file-with-answers-uploader";
import { FlashcardLimitDialog } from "./flashcard-limit-dialog";
import { ProcessingScreen } from "./processing-screen";
import { TextContentUploader } from "./text-content-uploader";

export function FlashcardCreator() {
  const t = useTranslations("Flashcards");
  const [activeTab, setActiveTab] = useState("ai-generated");
  const { goPricing } = useLocalizedNavigation();
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  // Centralized processing overlay state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingDone, setProcessingDone] = useState(false);
  const [processingLabel, setProcessingLabel] = useState<string | undefined>();
  const [processingFileName, setProcessingFileName] = useState<string>("");

  const handleProcessingStart = (fileName: string, label?: string) => {
    setProcessingFileName(fileName);
    setProcessingLabel(label);
    setProcessingDone(false);
    setIsProcessing(true);
  };

  const handleProcessingDone = (done: boolean) => {
    setProcessingDone(done);
    if (done) {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingDone(false);
        setProcessingLabel(undefined);
        setProcessingFileName("");
      }, 1500);
    } else {
      // Hide immediately on error
      setIsProcessing(false);
      setProcessingDone(false);
      setProcessingLabel(undefined);
      setProcessingFileName("");
    }
  };

  // Lock background scroll while processing to keep overlay fixed and clean
  useEffect(() => {
    if (isProcessing) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isProcessing]);

  // Handler for when limit is reached in uploader components
  const handleLimitReached = () => {
    setShowLimitDialog(true);
  };

  return (
    <ThinLayout maxWidth="6xl" classNames="py-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Limit Dialog */}
        <FlashcardLimitDialog
          open={showLimitDialog}
          onOpenChange={setShowLimitDialog}
          onUpgrade={() => goPricing()}
          onCancel={() => setShowLimitDialog(false)}
        />

        <div className={`mb-8 text-center ${isProcessing ? "invisible" : ""}`}>
          <h1 className="font-bold text-3xl tracking-tight">
            {t("create.generateFlashcards")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("create.subtitle")}</p>
        </div>

        <div className="relative">
          {isProcessing && (
            <div className="fixed inset-0 z-[1000] flex h-screen w-screen items-center justify-center bg-background ">
              <ProcessingScreen
                fileName={processingFileName || "File"}
                label={processingLabel}
                isDone={processingDone}
              />
            </div>
          )}

          <div
            className={`grid gap-6 lg:grid-cols-2 ${
              isProcessing ? "invisible overflow-hidden" : ""
            }`}
            aria-busy={isProcessing}
          >
            <div className="lg:col-span-2">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full border-none"
              >
                <TabsList className="grid w-full grid-cols-3 border-none ">
                  <TabsTrigger
                    value="ai-generated"
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {t("create.tabs.aiGenerated")}
                  </TabsTrigger>

                  <TabsTrigger
                    value="file-with-answers"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    {t("create.tabs.fileWithAnswers")}
                  </TabsTrigger>

                  <TabsTrigger
                    value="text-content"
                    className="flex items-center gap-2"
                  >
                    <Type className="h-4 w-4" />
                    {t("create.tabs.textContent")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="ai-generated" className="mt-6">
                  <AIGeneratedUploader
                    onProcessingStart={handleProcessingStart}
                    onProcessingDone={handleProcessingDone}
                    onLimitReached={handleLimitReached}
                  />
                </TabsContent>
                <TabsContent
                  value="file-with-answers"
                  className="mt-6 border-none"
                >
                  <FileWithAnswersUploader
                    onProcessingStart={handleProcessingStart}
                    onProcessingDone={handleProcessingDone}
                  />
                </TabsContent>
                <TabsContent value="text-content" className="mt-6 border-none">
                  <TextContentUploader
                    onProcessingStart={handleProcessingStart}
                    onProcessingDone={handleProcessingDone}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </ThinLayout>
  );
}
