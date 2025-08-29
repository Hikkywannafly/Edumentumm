"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FILE_UPLOAD_LIMITS,
  getAcceptedFileTypes,
} from "@/lib/utils/file-utils";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";

interface FileUploadAreaProps {
  onDrop: (acceptedFiles: File[]) => void;
  isDragActive: boolean;
  variant?: "file-with-answers" | "ai";
}

export function FileUploadArea({
  onDrop,
  isDragActive,
  variant = "file-with-answers",
}: FileUploadAreaProps) {
  const t = useTranslations("Quizzes");
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: getAcceptedFileTypes(),
    maxFiles: FILE_UPLOAD_LIMITS.maxFiles,
    maxSize: FILE_UPLOAD_LIMITS.maxSize,
  });

  const i18nKey =
    variant === "ai" ? "create.aiGenerated" : "create.fileWithAnswers";

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 border-none">
          <Upload className="h-5 w-5" />
          {t(`${i18nKey}.title` as any)}
        </CardTitle>
        <CardDescription>{t(`${i18nKey}.description` as any)}</CardDescription>
      </CardHeader>
      <CardContent className="border-none">
        <div
          {...getRootProps()}
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-2 font-medium text-lg">
            {isDragActive
              ? t(`${i18nKey}.dropHere` as any)
              : t(`${i18nKey}.dropOrSelect` as any)}
          </p>
          <p className="mb-4 text-muted-foreground text-sm">
            {t(`${i18nKey}.supportedFormats` as any)}
          </p>
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            <Badge variant="outline">PDF</Badge>
            <Badge variant="outline">DOC(X)</Badge>
            <Badge variant="outline">PPT(X)</Badge>
            <Badge variant="outline">XLS(X)</Badge>
            {variant === "ai" && <Badge variant="outline">TXT</Badge>}
            <Badge variant="outline">JSON</Badge>
            <Badge variant="outline">MD</Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            {t(`${i18nKey}.limits` as any)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
