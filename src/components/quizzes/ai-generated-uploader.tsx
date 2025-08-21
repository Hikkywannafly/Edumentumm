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
import { useQuizProcessor } from "@/hooks/use-quiz-processor";
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
import { Brain, Loader2, Settings, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileList } from "./file-list";
import { FileUploadArea } from "./file-upload-area";

type InputMode = "FILE" | "TEXT";

interface AIGeneratedUploaderProps {
  onProcessingStart?: (fileName: string, label?: string) => void;
  onProcessingDone?: (done: boolean) => void;
}

export function AIGeneratedUploader({
  onProcessingStart,
  onProcessingDone,
}: AIGeneratedUploaderProps) {
  const t = useTranslations("Quizzes");
  const { goQuizEdit } = useLocalizedNavigation();
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Input mode selection (auto-detected)
  const [inputMode, setInputMode] = useState<InputMode>("FILE");

  // AI Generation Settings
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

  const {
    uploadedFiles,
    addFiles,
    removeFile,
    generateFromFiles,
    extractFromFilesAI,
    isProcessing,
    hasFiles,
  } = useQuizProcessor();

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

  const handleGenerateQuiz = async () => {
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

      if (inputMode === "FILE") {
        // Generate from files based on generation mode
        if (generationMode === "GENERATE") {
          await generateFromFiles(settings);
        } else {
          // Use AI extraction instead of manual extraction
          await extractFromFilesAI(settings);
        }
      }

      setIsGenerating(false);

      setTimeout(() => {
        onProcessingDone?.(true);
        goQuizEdit();
      }, 2000);
    } catch (error) {
      console.error("Error generating quiz:", error);
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
                ? t("create.aiGenerated.aiDescription")
                : t("create.fileWithAnswers.description")}
            </p>
            <div className="flex gap-2">
              <Button
                disabled={!hasFiles || isProcessing || isGenerating}
                onClick={handleGenerateQuiz}
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
                        <SelectItem value="FAST">
                          {t("create.settings.fast")}
                        </SelectItem>
                        <SelectItem value="BALANCED">
                          {t("create.settings.balanced")}
                        </SelectItem>
                        <SelectItem value="THOROUGH">
                          {t("create.settings.thorough")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {parsingMode === "FAST" && (
                      <p className="text-muted-foreground text-xs">
                        {t("create.settings.fastModeWarning")}
                      </p>
                    )}
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
