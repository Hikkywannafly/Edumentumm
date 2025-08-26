"use client";

import { FileParserService } from "@/lib/services/file-parser.service";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type {
  UploadedFile,
  UseFileProcessorReturn,
} from "./quiz-creator-types";

export function useFileProcessor(): UseFileProcessorReturn {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileParser = new FileParserService();

  // File processing mutation
  const fileProcessingMutation = useMutation({
    mutationFn: async (files: File[]): Promise<UploadedFile[]> => {
      const processedFiles: UploadedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileInfo: UploadedFile = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          status: "processing",
          progress: 0,
          actualFile: file,
        };

        processedFiles.push(fileInfo);

        try {
          // Parse file content using the existing file parser service
          const parsedContent = await fileParser.parseFile(file);
          fileInfo.parsedContent = parsedContent;
          fileInfo.status = "success";
          fileInfo.progress = 100;
        } catch (error) {
          fileInfo.status = "error";
          fileInfo.error =
            error instanceof Error ? error.message : "Processing failed";
        }
      }

      return processedFiles;
    },
    onSuccess: (processedFiles) => {
      setUploadedFiles((prev) => [...prev, ...processedFiles]);
    },
  });

  // Helper functions
  const addFiles = async (files: File[]) => {
    await fileProcessingMutation.mutateAsync(files);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const clearFiles = () => {
    setUploadedFiles([]);
  };

  const reset = () => {
    setUploadedFiles([]);
    fileProcessingMutation.reset();
  };

  return {
    uploadedFiles,
    addFiles,
    removeFile,
    clearFiles,
    isProcessingFiles: fileProcessingMutation.isPending,
    hasFiles: uploadedFiles.some(
      (f) =>
        f.status === "success" && f.parsedContent && f.parsedContent.trim(),
    ),
    reset,
  };
}
