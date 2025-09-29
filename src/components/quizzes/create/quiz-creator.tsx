"use client";

import ThinLayout from "@/components/layout/thin-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuizLimit } from "@/hooks/quiz/use-quiz-limit";
import { useProcessingOverlay } from "@/hooks/use-processing-overlay";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { FileText, Sparkles, Type } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LimitDialog } from "../../shared/limit-dialog";
import { AIGeneratedUploader } from "./ai-generated-uploader";
import { ProcessingScreen } from "./processing-screen";
import { TextContentUploader } from "./text-content-uploader";

export function QuizCreator() {
  const t = useTranslations("Quizzes");
  const [activeTab, setActiveTab] = useState("ai-generated");
  const { goPricing } = useLocalizedNavigation();
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  const { data: limitData } = useQuizLimit();

  const {
    isVisible: isProcessing,
    fileName: processingFileName,
    label: processingLabel,
    isDone: processingDone,
    hasError: processingError,
    startProcessing,
    finishProcessing,
    hideProcessing,
    updateProcessingState,
  } = useProcessingOverlay();

  useEffect(() => {
    if (isProcessing) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isProcessing]);

  const handleProcessingStart = (fileName: string, label?: string) => {
    startProcessing(fileName, label || "Processing...");
  };

  const handleProcessingDone = (success: boolean) => {
    if (success) {
      updateProcessingState({ label: "Quiz created successfully!" });
    }
    setTimeout(() => {
      finishProcessing(success);
    }, 300);
  };

  // Check if user has reached the limit
  const hasReachedLimit = limitData && limitData.quizzesCreatedThisWeek >= 3;

  const handleTabChange = (value: string) => {
    if (hasReachedLimit) {
      setShowLimitDialog(true);
    } else {
      setActiveTab(value);
    }
  };

  // Handler for when limit is reached in uploader components
  const handleLimitReached = () => {
    setShowLimitDialog(true);
  };

  return (
    <ThinLayout maxWidth="6xl" classNames="py-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Limit Dialog */}
        <LimitDialog
          open={showLimitDialog}
          onOpenChange={setShowLimitDialog}
          onUpgrade={() => goPricing()}
          onCancel={() => setShowLimitDialog(false)}
        />

        <div className={`mb-8 text-center ${isProcessing ? "invisible" : ""}`}>
          <h1 className="font-bold text-3xl tracking-tight">
            {t("create.generateQuiz")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("create.subtitle")}</p>
        </div>

        <div className="relative">
          {isProcessing && (
            <div className="fixed inset-0 z-[1000] flex h-screen w-screen items-center justify-center bg-background ">
              <ProcessingScreen
                fileName={processingFileName}
                label={processingLabel}
                isDone={processingDone}
                hasError={processingError}
                onComplete={hideProcessing}
                showSuccessFor={4000}
                autoNavigate={!processingError}
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
              <Tabs value={activeTab} onValueChange={handleTabChange}>
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
                    onProcessingUpdate={updateProcessingState}
                    onLimitReached={handleLimitReached}
                  />
                </TabsContent>
                {/* <TabsContent
                  value="file-with-answers"
                  className="mt-6 border-none"
                >
                  <FileWithAnswersUploader
                    onProcessingStart={handleProcessingStart}
                    onProcessingDone={handleProcessingDone}
                  />
                </TabsContent> */}
                <TabsContent value="text-content" className="mt-6 border-none">
                  <TextContentUploader
                    onProcessingStart={handleProcessingStart}
                    onProcessingDone={handleProcessingDone}
                    onLimitReached={handleLimitReached}
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
