"use client";
// import { FileParserService } from "@/lib/services/file-parser-old.service";
import { FileParserService } from "@/lib/services/file-parser.service";
import type { ParsingMode } from "@/types/quiz";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type {
  UploadedFile,
  UseFileProcessorReturn,
} from "./quiz-creator-types";

export function useFileProcessor(): UseFileProcessorReturn {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileParser = new FileParserService();

  const fileProcessingMutation = useMutation({
    mutationFn: async ({
      files,
      parsingMode,
    }: { files: File[]; parsingMode?: ParsingMode }): Promise<
      UploadedFile[]
    > => {
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
          parsingMode: parsingMode || "BALANCED",
        };

        processedFiles.push(fileInfo);

        try {
          console.log(
            `🔄 Processing file: ${file.name} with ${parsingMode || "BALANCED"} mode`,
          );

          const parsedContent = await fileParser.parseFile(file, {
            mode: parsingMode || "BALANCED",
          });

          fileInfo.parsedContent = parsedContent;
          fileInfo.metadata = {
            parsingMode: parsingMode || "BALANCED",
            skippedContent: [],
            originalFileSize: file.size,
            contentLength: parsedContent.length,
            processingTimestamp: new Date().toISOString(),
          };

          if (parsingMode === "FAST") {
            fileInfo.metadata.skippedContent =
              fileInfo.metadata.skippedContent || [];
            fileInfo.metadata.skippedContent.push(
              "Images and complex tables skipped for speed",
            );
            if (file.size > 5 * 1024 * 1024) {
              // 5MB
              fileInfo.metadata.skippedContent.push(
                "Large file - content may be truncated",
              );
            }
          } else if (parsingMode === "THOROUGH") {
            fileInfo.metadata.skippedContent =
              fileInfo.metadata.skippedContent || [];
            fileInfo.metadata.skippedContent.push(
              "Processing all content - may take longer",
            );
          }

          console.log(`✅ Successfully processed ${file.name}:`, {
            mode: parsingMode,
            contentLength: parsedContent.length,
            fileSize: file.size,
          });

          fileInfo.status = "success";
          fileInfo.progress = 100;
        } catch (error) {
          console.error(`❌ Error processing file ${file.name}:`, error);
          fileInfo.status = "error";
          fileInfo.error =
            error instanceof Error ? error.message : "Processing failed";
          fileInfo.metadata = {
            parsingMode: parsingMode || "BALANCED",
            skippedContent: [],
            errorTimestamp: new Date().toISOString(),
            originalFileSize: file.size,
          };
        }
      }

      return processedFiles;
    },
    onSuccess: (processedFiles) => {
      setUploadedFiles((prev) => [...prev, ...processedFiles]);
    },
  });

  // Helper functions
  const addFiles = async (files: File[], parsingMode?: ParsingMode) => {
    await fileProcessingMutation.mutateAsync({ files, parsingMode });
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
