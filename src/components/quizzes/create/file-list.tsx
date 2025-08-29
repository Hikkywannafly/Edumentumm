"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { UploadedFile } from "@/hooks/quiz/use-file-upload";
import { formatFileSize, getFileIconClassName } from "@/lib/utils/file-utils";
import { AlertCircle, CheckCircle, FileText, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface FileListProps {
  files: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
}

export function FileList({ files, onRemoveFile }: FileListProps) {
  const t = useTranslations("Quizzes");

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
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  if (files.length === 0) return null;

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>{t("create.fileWithAnswers.uploadedFiles")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <FileText className={getFileIconClassName(file.name)} />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <p className="truncate font-medium">{file.name}</p>
                  {getStatusIcon(file.status)}
                </div>
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <span>{formatFileSize(file.size)}</span>
                  {file.status === "uploading" && (
                    <span>{t("create.fileWithAnswers.uploading")}</span>
                  )}
                  {file.status === "processing" && (
                    <span>{t("create.fileWithAnswers.processing")}</span>
                  )}

                  {file.status === "error" && (
                    <span className="text-red-600">{file.error}</span>
                  )}
                </div>
                {(file.status === "uploading" ||
                  file.status === "processing") && (
                  <Progress value={file.progress} className="mt-2" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFile(file.id)}
                className="text-muted-foreground hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
