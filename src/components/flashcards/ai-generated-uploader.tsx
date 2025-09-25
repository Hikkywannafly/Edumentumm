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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlashProcessor } from "@/hooks/use-flash-processor";
import {
  FILE_UPLOAD_LIMITS,
  getAcceptedFileTypes,
} from "@/lib/utils/file-utils";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { useFlashcardEditorStore } from "@/stores/flashcard-editor-store";
import { Brain, Loader2, Settings, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileList } from "./file-list";
import { FileUploadArea } from "./file-upload-area";
import { SupportedFormats } from "./supported-formats";

type InputMode = "FILE" | "TEXT";

interface AIGeneratedUploaderProps {
  onProcessingStart?: (fileName: string, label?: string) => void;
  onProcessingDone?: (done: boolean) => void;
}

export function AIGeneratedUploader({
  onProcessingStart,
  onProcessingDone,
}: AIGeneratedUploaderProps) {
  const t = useTranslations("Flashcards");
  const { goFlashcardEdit } = useLocalizedNavigation();
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Input mode selection (auto-detected)
  const [inputMode, setInputMode] = useState<InputMode>("FILE");

  // Settings
  const [generationMode, setGenerationMode] = useState<"GENERATE" | "EXTRACT">(
    "GENERATE",
  );
  const [flashcardType, setFlashcardType] = useState<
    "QUESTIONS" | "VOCABULARY"
  >("QUESTIONS");
  const [fileProcessingMode, setFileProcessingMode] = useState<
    "PARSE_THEN_SEND" | "SEND_DIRECT"
  >("PARSE_THEN_SEND");
  const [visibility, setVisibility] = useState<string>("private");
  const [language, setLanguage] = useState<string>("auto");
  const [numberOfCards, setNumberOfCards] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>("easy");
  const [parsingMode, setParsingMode] = useState<string>("balanced");

  const {
    uploadedFiles,
    addFiles,
    removeFile,
    generateFromFiles,
    extractFromFilesAI,
    isProcessing,
    hasFiles,
  } = useFlashProcessor();

  const { setEditing } = useFlashcardEditorStore();

  const { isDragActive } = useDropzone({
    onDrop: addFiles,
    accept: getAcceptedFileTypes(),
    maxFiles: FILE_UPLOAD_LIMITS.maxFiles,
    maxSize: FILE_UPLOAD_LIMITS.maxSize,
  });

  // Mark initial mount as complete
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
    }
  }, [isInitialMount]);

  // Auto-select mode depending on input presence
  useEffect(() => {
    if (hasFiles) {
      setInputMode("FILE");
    } else {
      setInputMode("FILE");
    }
  }, [hasFiles]);

  const handleGenerateFlashcards = async () => {
    setIsGenerating(true);
    onProcessingStart?.(
      uploadedFiles[0]?.name || "File",
      generationMode === "GENERATE"
        ? t("create.aiGenerated.aiGenerating")
        : t("create.fileWithAnswers.processing"),
    );
    try {
      const settings = {
        generationMode,
        flashcardType,
        fileProcessingMode,
        visibility,
        language,
        numberOfCards,
        difficulty,
        parsingMode,
      };
      if (inputMode === "FILE") {
        if (generationMode === "GENERATE") {
          await generateFromFiles(settings);
        } else {
          await extractFromFilesAI(settings);
        }
      }
      setEditing(true);
      goFlashcardEdit();
    } catch (error) {
      console.error("Error generating flashcards:", error);
      setIsGenerating(false);
      onProcessingDone?.(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main area */}
        <div className="space-y-6 lg:col-span-2">
          {/* Upload Area */}
          <FileUploadArea
            onDrop={addFiles}
            isDragActive={isDragActive}
            variant="ai"
          />
          <FileList files={uploadedFiles} onRemoveFile={removeFile} />

          {/* Action */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {generationMode === "GENERATE"
                ? t("create.aiGenerated.guidance")
                : t("create.fileWithAnswers.description")}
            </p>
            <div className="flex gap-2">
              <Button
                disabled={!hasFiles || isProcessing || isGenerating}
                onClick={handleGenerateFlashcards}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {generationMode === "GENERATE"
                      ? t("create.aiGenerated.aiGenerating")
                      : t("create.fileWithAnswers.processing")}
                  </>
                ) : (
                  <>
                    {generationMode === "GENERATE" ? (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {t("create.aiGenerated.createDeck")}
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        {t("create.fileWithAnswers.createDeck")}
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Settings sidebar */}
        <div>
          <Card className="border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 border-none">
                <Settings className="h-5 w-5" />
                {t("create.settings.title")}
              </CardTitle>
              <CardDescription>
                {t("create.settings.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 border-none">
              <div className="space-y-2">
                <Label>{t("create.settings.generationMode")}</Label>
                <Select
                  value={generationMode}
                  onValueChange={(value: "GENERATE" | "EXTRACT") =>
                    setGenerationMode(value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="GENERATE">
                      🧠 {t("create.settings.modeGenerate")}
                    </SelectItem>
                    <SelectItem value="EXTRACT">
                      📋 {t("create.settings.modeExtract")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Flashcard Type - Only show when generation mode is GENERATE */}
              {generationMode === "GENERATE" && (
                <div className="space-y-2">
                  <Label>Flashcard Type</Label>
                  <Select
                    value={flashcardType}
                    onValueChange={(value: "QUESTIONS" | "VOCABULARY") =>
                      setFlashcardType(value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectItem value="QUESTIONS">❓ Questions</SelectItem>
                      <SelectItem value="VOCABULARY">📚 Vocabulary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t("create.settings.fileProcessing")}</Label>
                <Select
                  value={fileProcessingMode}
                  onValueChange={(value: "PARSE_THEN_SEND" | "SEND_DIRECT") =>
                    setFileProcessingMode(value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="PARSE_THEN_SEND">
                      📄 {t("create.settings.fileProcessingParseThenSend")}
                    </SelectItem>
                    <SelectItem value="SEND_DIRECT">
                      🎯 {t("create.settings.fileProcessingSendDirect")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("create.settings.visibility")}</Label>
                <Select
                  value={visibility}
                  onValueChange={(value: string) => setVisibility(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="private">
                      🔒 {t("create.settings.private")}
                    </SelectItem>
                    <SelectItem value="public">
                      🌍 {t("create.settings.public")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("create.settings.language")}</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="auto">
                      🌐 {t("create.settings.autoDetect")}
                    </SelectItem>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {generationMode === "GENERATE" && (
                <>
                  <div className="space-y-2">
                    <Label>{t("create.settings.numberOfCards")}</Label>
                    <Select
                      value={String(numberOfCards)}
                      onValueChange={(val) => setNumberOfCards(Number(val))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {[5, 10, 20, 30, 50].map((val) => (
                          <SelectItem key={val} value={String(val)}>
                            {val}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("create.settings.difficulty")}</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="easy">
                          😊 {t("create.settings.easy")}
                        </SelectItem>
                        <SelectItem value="medium">
                          😐 {t("create.settings.medium")}
                        </SelectItem>
                        <SelectItem value="hard">
                          😤 {t("create.settings.hard")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("create.settings.parsingMode")}</Label>
                    <Select value={parsingMode} onValueChange={setParsingMode}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="fast">
                          ⚡ {t("create.settings.fast")}
                        </SelectItem>
                        <SelectItem value="balanced">
                          ⚖️ {t("create.settings.balanced")}
                        </SelectItem>
                        <SelectItem value="thorough">
                          🔍 {t("create.settings.thorough")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {parsingMode === "fast" && (
                      <p className="text-muted-foreground text-xs">
                        {t("create.settings.fastModeWarning")}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Supported Formats */}
          <SupportedFormats />
        </div>
      </div>
    </div>
  );
}
