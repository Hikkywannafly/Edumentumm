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
import { useQuizCreator } from "@/hooks/quiz/use-quiz-creator";
import {
  FILE_UPLOAD_LIMITS,
  getAcceptedFileTypes,
} from "@/lib/utils/file-utils";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import type {
  Difficulty,
  Language,
  ParsingMode,
  QuestionType,
  QuizMode,
  Task,
  Visibility,
} from "@/types/quiz";
import {
  AlertTriangle,
  Brain,
  Loader2,
  Settings,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileList } from "./file-list";
import { FileUploadArea } from "./file-upload-area";

interface AIGeneratedUploaderProps {
  onProcessingStart?: (fileName: string, label?: string) => void;
  onProcessingDone?: (done: boolean) => void;
  onProcessingUpdate?: (updates: { label?: string }) => void;
}

export function AIGeneratedUploader({
  onProcessingStart,
  onProcessingDone,
  onProcessingUpdate,
}: AIGeneratedUploaderProps) {
  const t = useTranslations("Quizzes");
  const { goQuizEdit } = useLocalizedNavigation();

  const {
    uploadedFiles,
    addFiles,
    removeFile,
    generateQuiz,
    extractQuiz,
    saveQuiz,
    isGenerating,
    isSaving,
    isProcessingFiles,
    hasFiles,
    reset,
  } = useQuizCreator();

  const [generationMode, setGenerationMode] = useState<"GENERATE" | "EXTRACT">(
    "GENERATE",
  );
  const [fileProcessingMode, setFileProcessingMode] = useState<
    "PARSE_THEN_SEND" | "SEND_DIRECT"
  >("PARSE_THEN_SEND");
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [language, setLanguage] = useState<Language>("AUTO");
  const [questionType, setQuestionType] = useState<QuestionType | "MIXED">(
    "MULTIPLE_CHOICE",
  );
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(5);
  const [mode, setMode] = useState<QuizMode>("QUIZ");
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [task, setTask] = useState<Task>("GENERATE_QUIZ");
  const [parsingMode, setParsingMode] = useState<ParsingMode>("BALANCED");

  const getModeInfo = (mode: ParsingMode) => {
    switch (mode) {
      case "FAST":
        return {
          description:
            t("create.settings.fastModeDescription") ||
            "Quick processing, skips images and complex tables",
          warning:
            t("create.settings.fastModeWarning") ||
            "Some content may be skipped for faster processing",
          color: "text-orange-600",
        };
      case "BALANCED":
        return {
          description:
            t("create.settings.balancedModeDescription") ||
            "Good balance of speed and accuracy",
          warning: null,
          color: "text-blue-600",
        };
      case "THOROUGH":
        return {
          description:
            t("create.settings.thoroughModeDescription") ||
            "Complete processing, includes all content",
          warning:
            t("create.settings.thoroughModeInfo") ||
            "May take longer but captures all content",
          color: "text-green-600",
        };
      default:
        return {
          description: "Standard processing mode",
          warning: null,
          color: "text-blue-600",
        };
    }
  };

  const currentModeInfo = getModeInfo(parsingMode);

  const { isDragActive } = useDropzone({
    accept: getAcceptedFileTypes(),
    maxFiles: FILE_UPLOAD_LIMITS.maxFiles,
    maxSize: FILE_UPLOAD_LIMITS.maxSize,
  });

  const handleGenerateQuiz = async () => {
    if (!hasFiles) return;

    const settings = {
      generationMode,
      fileProcessingMode,
      visibility,
      language,
      questionType: questionType === "MIXED" ? "MIXED" : questionType,
      numberOfQuestions,
      mode,
      difficulty,
      task,
      parsingMode,
    };

    try {
      // Phase 1: Start processing (AI generation/extraction)
      onProcessingStart?.(
        uploadedFiles[0]?.name || "File",
        generationMode === "GENERATE"
          ? t("create.aiGenerated.aiGenerating")
          : t("create.fileWithAnswers.processing"),
      );

      // Phase 2: Generate or extract quiz
      const quiz =
        generationMode === "GENERATE"
          ? await generateQuiz(settings)
          : await extractQuiz(settings);

      // Phase 3: Update processing state to show saving
      if (onProcessingUpdate) {
        onProcessingUpdate({ label: "Saving quiz..." });
      }

      // Phase 4: Save quiz to backend
      const result = await saveQuiz(quiz, settings);

      // Phase 5: Mark as done
      onProcessingDone?.(true);

      // Phase 6: Navigate after longer delay to ensure processing screen covers transition
      setTimeout(() => {
        reset();
        goQuizEdit(result.id, result.slug);
      }, 4000); // Increased to 4 seconds to ensure smooth transition
    } catch (error) {
      console.error("Error processing quiz:", error);
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
            onDrop={(files) => addFiles(files, parsingMode)}
            isDragActive={isDragActive}
            variant="ai"
          />
          <FileList files={uploadedFiles} onRemoveFile={removeFile} />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">
                {generationMode === "GENERATE"
                  ? t("create.aiGenerated.aiDescription")
                  : t("create.fileWithAnswers.description")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                disabled={
                  !hasFiles || isProcessingFiles || isGenerating || isSaving
                }
                onClick={handleGenerateQuiz}
                className="flex items-center gap-2"
              >
                {isGenerating || isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isSaving
                      ? "Saving quiz..."
                      : generationMode === "GENERATE"
                        ? t("create.aiGenerated.aiGenerating")
                        : t("create.fileWithAnswers.processing")}
                  </>
                ) : (
                  <>
                    {generationMode === "GENERATE" ? (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {t("create.aiGenerated.createQuiz")}
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        {t("create.fileWithAnswers.createQuiz")}
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
                  onValueChange={(v: Visibility) => setVisibility(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="PRIVATE">
                      {t("create.settings.private")}
                    </SelectItem>
                    <SelectItem value="PUBLIC">
                      {t("create.settings.public")}
                    </SelectItem>
                    <SelectItem value="UNLISTED">
                      {t("create.settings.unlisted")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("create.settings.language")}</Label>
                <Select
                  value={language}
                  onValueChange={(v: Language) => setLanguage(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="AUTO">
                      🌐 {t("create.settings.autoDetect")}
                    </SelectItem>
                    <SelectItem value="EN">🇺🇸 English</SelectItem>
                    <SelectItem value="VI">🇻🇳 Tiếng Việt</SelectItem>
                    <SelectItem value="KO">🇰🇷 한국어</SelectItem>
                    <SelectItem value="ZH">🇨🇳 中文</SelectItem>
                    <SelectItem value="JA">🇯🇵 日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {generationMode === "GENERATE" && (
                <>
                  <div className="space-y-2">
                    <Label>{t("create.settings.questionType")}</Label>
                    <Select
                      value={questionType}
                      onValueChange={(v: QuestionType | "MIXED") =>
                        setQuestionType(v)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="MULTIPLE_CHOICE">
                          {t("create.settings.multipleChoice")}
                        </SelectItem>
                        <SelectItem value="MIXED">
                          {t("create.settings.mixed")}
                        </SelectItem>
                        <SelectItem value="TRUE_FALSE">
                          {t("create.settings.trueFalse")}
                        </SelectItem>
                        <SelectItem value="FILL_BLANK">
                          {t("create.settings.fillBlank")}
                        </SelectItem>
                        <SelectItem value="FREE_RESPONSE">
                          {t("create.settings.freeResponse")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{t("create.settings.numberOfQuestions")}</Label>
                      <Select
                        value={String(numberOfQuestions)}
                        onValueChange={(val) =>
                          setNumberOfQuestions(Number(val))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 6 }, (_, i) => {
                            const val = i + 5;
                            return (
                              <SelectItem key={val} value={String(val)}>
                                {val}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("create.settings.difficulty")}</Label>
                      <Select
                        value={difficulty}
                        onValueChange={(v: Difficulty) => setDifficulty(v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EASY">
                            {t("create.settings.easy")}
                          </SelectItem>
                          <SelectItem value="MEDIUM">
                            {t("create.settings.medium")}
                          </SelectItem>
                          <SelectItem value="HARD">
                            {t("create.settings.hard")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{t("create.settings.modeLabel")}</Label>
                      <Select
                        value={mode}
                        onValueChange={(v: QuizMode) => setMode(v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="QUIZ">
                            {t("create.settings.quiz")}
                          </SelectItem>
                          <SelectItem value="FLASHCARD">
                            {t("create.settings.flashcard")}
                          </SelectItem>
                          <SelectItem value="STUDY_GUIDE">
                            {t("create.settings.studyGuide")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("create.settings.taskLabel")}</Label>
                      <Select
                        value={task}
                        onValueChange={(v: Task) => setTask(v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GENERATE_QUIZ">
                            {t("create.settings.taskGenerateQuiz")}
                          </SelectItem>
                          <SelectItem value="REVIEW">
                            {t("create.settings.taskReview")}
                          </SelectItem>
                          <SelectItem value="TEST">
                            {t("create.settings.taskTest")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("create.settings.parsingMode")}</Label>
                    <Select
                      value={parsingMode}
                      onValueChange={(v: ParsingMode) => setParsingMode(v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FAST" className="flex items-center">
                          <div className="flex items-center gap-2">
                            {t("create.settings.fast")}
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="BALANCED"
                          className="flex items-center"
                        >
                          <div className="flex items-center gap-2">
                            {t("create.settings.balanced")}
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="THOROUGH"
                          className="flex items-center"
                        >
                          <div className="flex items-center gap-2">
                            {t("create.settings.thorough")}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Mode-specific descriptions */}
                    <div className="space-y-1 text-muted-foreground text-xs">
                      <p className={currentModeInfo.color}>
                        {currentModeInfo.description}
                      </p>
                      {currentModeInfo.warning && (
                        <p className="flex items-center gap-1 text-orange-600">
                          <AlertTriangle className="h-3 w-3" />
                          {currentModeInfo.warning}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
