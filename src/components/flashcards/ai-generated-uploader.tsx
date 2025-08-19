"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { generateFlashcardsWithAI } from "@/lib/services/flashcard-generate.service";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { useFlashcardEditorStore } from "@/stores/flashcard-editor-store";
import {
  AlertCircle,
  Brain,
  CheckCircle,
  FileText,
  Loader2,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "processing" | "ai-generating" | "success" | "error";
  progress: number;
  error?: string;
  actualFile?: File; // Store the actual File object
}

interface AIGeneratedUploaderProps {
  onProcessingStart?: (fileName: string, label?: string) => void;
  onProcessingDone?: (done: boolean) => void;
}

export function AIGeneratedUploader({
  onProcessingStart,
  onProcessingDone,
}: AIGeneratedUploaderProps) {
  const t = useTranslations("Flashcards");
  const { toast } = useToast();
  const { goFlashcardEdit } = useLocalizedNavigation();
  const { setFlashcardData, setEditing } = useFlashcardEditorStore();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Settings
  const [generationMode, setGenerationMode] = useState<"GENERATE" | "EXTRACT">(
    "GENERATE",
  );
  const [fileProcessingMode, setFileProcessingMode] = useState<
    "PARSE_THEN_SEND" | "SEND_DIRECT"
  >("PARSE_THEN_SEND");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [language, setLanguage] = useState<string>("auto");
  const [numberOfCards, setNumberOfCards] = useState<string>("10-20");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [parsingMode, setParsingMode] = useState<string>("balanced");

  const hasFiles = uploadedFiles.length > 0;
  const canGenerate = hasFiles;

  // Build settings object
  const settings = {
    language,
    numberOfCards,
    difficulty,
    generationMode,
    fileProcessing: fileProcessingMode,
    parsingMode,
    visibility,
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      status: "uploading",
      progress: 0,
      actualFile: file, // Store the actual File object
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Mark files as ready for processing
    for (const file of newFiles) {
      setTimeout(() => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "success", progress: 100 } : f,
          ),
        );
      }, 1000);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxFiles: 5,
    maxSize: 50 * 1024 * 1024, // 50MB for AI processing
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "docx":
      case "doc":
        return <FileText className="h-8 w-8 text-blue-500" />;
      case "pptx":
      case "ppt":
        return <FileText className="h-8 w-8 text-orange-500" />;
      case "xlsx":
      case "xls":
        return <FileText className="h-8 w-8 text-green-500" />;
      case "txt":
        return <FileText className="h-8 w-8 text-gray-500" />;
      case "md":
        return <FileText className="h-8 w-8 text-purple-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        );
      case "processing":
        return (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
        );
      case "ai-generating":
        return <Brain className="h-4 w-4 animate-pulse text-purple-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return t("create.aiGenerated.uploading");
      case "processing":
        return t("create.aiGenerated.processing");
      case "ai-generating":
        return t("create.aiGenerated.aiGenerating");
      case "success":
        return t("create.aiGenerated.success");
      case "error":
        return t("create.aiGenerated.error");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const handleGenerateFlashcards = async () => {
    if (!uploadedFiles.length) {
      toast({
        title: "Error",
        description: "Please upload a file first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    onProcessingStart?.("Generating flashcards", "AI Generation");

    try {
      console.log("🚀 Starting flashcard generation...");
      console.log("⚙️ Generation settings:", settings);

      let result: {
        flashcards: any[];
        title: string;
        description: string;
        metadata?: any;
      } | null = null;

      const hasFiles = uploadedFiles.some((file) => file.actualFile);

      if (hasFiles) {
        // Generate from file - use the first file
        const firstFile = uploadedFiles.find((f) => f.actualFile);
        if (firstFile?.actualFile) {
          console.log("🤖 Generating from file:", firstFile.name);

          let fileContent = "";
          const useDirectMode = fileProcessingMode === "SEND_DIRECT";

          // If not using direct mode, try to parse file content first
          if (!useDirectMode) {
            try {
              if (
                firstFile.actualFile.type === "text/plain" ||
                firstFile.name.endsWith(".txt")
              ) {
                fileContent = await firstFile.actualFile.text();
                console.log(
                  "📄 Parsed TXT file content:",
                  `${fileContent.substring(0, 500)}...`,
                );
                console.log("📊 TXT file content length:", fileContent.length);
              } else if (firstFile.name.endsWith(".md")) {
                fileContent = await firstFile.actualFile.text();
                console.log(
                  "📄 Parsed MD file content:",
                  `${fileContent.substring(0, 500)}...`,
                );
                console.log("📊 MD file content length:", fileContent.length);
              } else {
                // For other file types like .docx, fallback to direct mode
                console.warn(
                  `File type ${firstFile.actualFile.type} not supported for parse mode. Falling back to direct mode.`,
                );
                // Don't throw error, just use direct mode instead
                fileContent = "";
              }
            } catch (error) {
              console.warn(
                "Failed to parse file content, falling back to direct mode:",
                error,
              );
              fileContent = "";
            }
          }

          // Determine final processing mode (may fallback to SEND_DIRECT)
          const finalProcessingMode = fileContent.trim()
            ? fileProcessingMode
            : "SEND_DIRECT";

          console.log("🔀 Final processing mode:", finalProcessingMode);
          console.log("📤 Content being sent to AI:");
          console.log("  - Has file content:", !!fileContent.trim());
          console.log("  - File content length:", fileContent.length);
          console.log("  - File name:", firstFile.name);
          console.log("  - File type:", firstFile.actualFile.type);
          console.log("  - File size:", firstFile.actualFile.size);

          if (fileContent.trim()) {
            console.log(
              "  - File content preview:",
              `${fileContent.substring(0, 300)}...`,
            );
          } else {
            console.log("  - Will send file directly to AI (binary mode)");
          }

          result = await generateFlashcardsWithAI(
            fileContent.trim() ? fileContent : "",
            firstFile.actualFile,
            {
              ...settings,
              fileProcessingMode: finalProcessingMode,
            },
          );
        }
      }

      console.log("✅ Generated flashcards:", result?.flashcards?.length || 0);

      if (result && result.flashcards && result.flashcards.length > 0) {
        // Store the generated flashcard data with auto-generated title and description
        const flashcardSet = {
          title: result.title,
          description: result.description,
          flashcards: result.flashcards,
          metadata: result.metadata || {
            total_cards: result.flashcards.length,
            difficulty,
            estimated_study_time: Math.ceil(result.flashcards.length * 0.5),
            generated_from: "file",
            generation_mode: generationMode,
          },
        };

        console.log("📦 Setting flashcard data:", flashcardSet);
        setFlashcardData(flashcardSet);
        setEditing(true);

        onProcessingDone?.(true);
        goFlashcardEdit();
      } else {
        throw new Error("No flashcards generated");
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast({
        title: "Generation Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate flashcards",
        variant: "destructive",
      });
      onProcessingDone?.(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main area */}
        <div className="space-y-6 lg:col-span-2">
          {/* Upload Area */}
          <Card className="border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {t("create.aiGenerated.title")}
              </CardTitle>
              <CardDescription>
                {t("create.aiGenerated.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragActive
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <Brain className="mx-auto mb-4 h-12 w-12 text-purple-400" />
                <p className="mb-2 font-medium text-lg">
                  {isDragActive
                    ? t("create.aiGenerated.dropHere")
                    : t("create.aiGenerated.dropOrSelect")}
                </p>
                <p className="mb-4 text-muted-foreground text-sm">
                  {t("create.aiGenerated.supportedFormats")}
                </p>
                <div className="mb-4 flex flex-wrap justify-center gap-2">
                  <Badge variant="outline">PDF</Badge>
                  <Badge variant="outline">DOC(X)</Badge>
                  <Badge variant="outline">PPT(X)</Badge>
                  <Badge variant="outline">XLS(X)</Badge>
                  <Badge variant="outline">TXT</Badge>
                  <Badge variant="outline">MD</Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  {t("create.aiGenerated.limits")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("create.aiGenerated.uploadedFiles")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 rounded-lg border p-4"
                    >
                      {getFileIcon(file.name)}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="truncate font-medium">{file.name}</p>
                          {getStatusIcon(file.status)}
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground text-sm">
                          <span>{formatFileSize(file.size)}</span>
                          <span
                            className={
                              file.status === "ai-generating"
                                ? "text-purple-600"
                                : ""
                            }
                          >
                            {getStatusText(file.status)}
                          </span>
                          {file.status === "error" && (
                            <span className="text-red-600">{file.error}</span>
                          )}
                        </div>
                        {(file.status === "uploading" ||
                          file.status === "processing" ||
                          file.status === "ai-generating") && (
                          <Progress value={file.progress} className="mt-2" />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {generationMode === "GENERATE"
                ? t("create.aiGenerated.guidance")
                : t("create.fileWithAnswers.description")}
            </p>
            <div className="flex gap-2">
              <Button
                disabled={!canGenerate || isGenerating}
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

              {generationMode === "GENERATE" && (
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
              )}

              {generationMode === "EXTRACT" && (
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
              )}

              <div className="space-y-2">
                <Label>{t("create.settings.visibility")}</Label>
                <Select
                  value={visibility}
                  onValueChange={(value: "private" | "public") =>
                    setVisibility(value)
                  }
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
                <Label>
                  {generationMode === "EXTRACT"
                    ? t("create.settings.languageOfTheQuiz")
                    : t("create.settings.language")}
                </Label>
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
                      value={numberOfCards}
                      onValueChange={setNumberOfCards}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="5-10">5-10 cards</SelectItem>
                        <SelectItem value="10-20">10-20 cards</SelectItem>
                        <SelectItem value="20-30">20-30 cards</SelectItem>
                        <SelectItem value="30-50">30-50 cards</SelectItem>
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
                  </div>

                  <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                    <p>{t("create.settings.fastModeWarning")}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Supported Formats */}
          <Card className="mt-6 border-none">
            <CardHeader>
              <CardTitle className="text-lg">
                {t("create.supportedFormats.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">PDF</Badge>
                  <Badge variant="secondary">DOC(X)</Badge>
                  <Badge variant="secondary">PPT(X)</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">XLS(X)</Badge>
                  <Badge variant="secondary">TXT</Badge>
                  <Badge variant="secondary">MD</Badge>
                </div>
                <p className="mt-2 text-muted-foreground text-xs">
                  {t("create.supportedFormats.limit")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
