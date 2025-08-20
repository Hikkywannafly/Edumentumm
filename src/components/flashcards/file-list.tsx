import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatFileSize, getFileIconClassName } from "@/lib/utils/file-utils";
import type { UploadedFile } from "@/stores/flashcard-editor-store";
import { AlertCircle, CheckCircle, FileText, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface FileListProps {
  files: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
}

export function FileList({ files, onRemoveFile }: FileListProps) {
  const t = useTranslations("Flashcards");

  if (files.length === 0) return null;

  const getFileIcon = (fileName: string) => {
    return <FileText className={getFileIconClassName(fileName)} />;
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
      case "success":
        return t("create.aiGenerated.success");
      case "error":
        return t("create.aiGenerated.error");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("create.aiGenerated.uploadedFiles")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {files.map((file) => (
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
                  <span>{getStatusText(file.status)}</span>
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
                className="text-muted-foreground hover:text-destructive"
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
