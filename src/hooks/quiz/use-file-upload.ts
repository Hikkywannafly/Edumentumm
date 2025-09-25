import { FileParserService } from "@/lib/services/file-parser-old.service";
import { useCallback, useState } from "react";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "processing" | "success" | "error";
  progress: number;
  parsedContent?: string;
  actualFile?: File;
  error?: string;
}

export interface FileUploadResult {
  content: string;
  sourceFiles: string[];
  totalFiles: number;
  totalSize: number;
}

const fileParser = new FileParserService();

export function useFileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const processFile = useCallback(
    async (fileInfo: UploadedFile, actualFile: File) => {
      try {
        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === fileInfo.id
              ? { ...file, status: "processing", progress: 50 }
              : file,
          ),
        );

        const content = await fileParser.parseFile(actualFile);

        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === fileInfo.id
              ? {
                  ...file,
                  status: "success" as const,
                  progress: 100,
                  parsedContent: content,
                  actualFile,
                }
              : file,
          ),
        );
      } catch (error) {
        console.error("Error processing file:", error);
        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === fileInfo.id
              ? {
                  ...file,
                  status: "error",
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                }
              : file,
          ),
        );
      }
    },
    [],
  );

  const uploadFiles = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: UploadedFile[] = acceptedFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        status: "uploading",
        progress: 0,
      }));

      setUploadedFiles((prev) => {
        // Remove any existing files with the same name to prevent duplicates
        const filteredPrev = prev.filter(
          (existingFile) =>
            !newFiles.some((newFile) => newFile.name === existingFile.name),
        );
        return [...filteredPrev, ...newFiles];
      });

      // Process files concurrently
      await Promise.all(
        newFiles.map((file, idx) => processFile(file, acceptedFiles[idx])),
      );
    },
    [processFile],
  );

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  const getProcessedContent = useCallback((): FileUploadResult | null => {
    const successfulFiles = uploadedFiles.filter(
      (f) => f.status === "success" && f.parsedContent,
    );

    if (successfulFiles.length === 0) {
      return null;
    }

    const combinedContent = successfulFiles
      .map((f) => f.parsedContent)
      .join("\n\n--- FILE SEPARATOR ---\n\n");

    return {
      content: combinedContent,
      sourceFiles: successfulFiles.map((f) => f.name),
      totalFiles: successfulFiles.length,
      totalSize: successfulFiles.reduce((sum, f) => sum + f.size, 0),
    };
  }, [uploadedFiles]);

  const reset = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  return {
    // Core functions
    uploadFiles,
    removeFile,
    getProcessedContent,
    reset,

    // State
    uploadedFiles,
    isProcessing: uploadedFiles.some(
      (f) => f.status === "uploading" || f.status === "processing",
    ),
    hasFiles: uploadedFiles.length > 0,
    hasSuccessfulFiles: uploadedFiles.some((f) => f.status === "success"),
    hasErrors: uploadedFiles.some((f) => f.status === "error"),

    // Error details
    errors: uploadedFiles
      .filter((f) => f.status === "error")
      .map((f) => ({ fileName: f.name, error: f.error })),
  };
}
