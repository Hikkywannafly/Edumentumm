"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { folderAPI } from "../../../../lib/api/folder";
import type { FileResponse, FolderResponse } from "../../../../types/folder";
import { FileUploadArea } from "../../../quizzes/file-upload-area";

interface UploadFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: FolderResponse[];
  onUploadSuccess?: (folderId: string, files: FileResponse[]) => void;
}

export function UploadFileDialog({
  open,
  onOpenChange,
  folders,
  onUploadSuccess,
}: UploadFileDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [folderId, setFolderId] = useState<string>("root");
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = (acceptedFiles: File[]) => {
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    const validFiles = acceptedFiles.filter(
      (file) => file.size <= MAX_FILE_SIZE,
    );

    if (validFiles.length !== acceptedFiles.length) {
      toast.error("Một số file vượt quá giới hạn 100MB!");
    }

    setFiles(validFiles);
  };

  const uploadFiles = async () => {
    if (!files.length) {
      toast.error("Vui lòng chọn ít nhất 1 file!");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const response = await folderAPI.uploadFiles(
        folderId,
        files,
        (progress) => setUploadProgress(progress),
      );

      // Ensure we have an array of files
      const uploadedFiles = Array.isArray(response) ? response : [response];

      if (onUploadSuccess) {
        onUploadSuccess(folderId, uploadedFiles);
      }

      toast.success("Tải lên thành công!");
      setFiles([]);
      setFolderId("root");
      setIsDragActive(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Upload thất bại:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Có lỗi khi tải lên file!");
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tải lên tài liệu</DialogTitle>
          <DialogDescription>
            Chọn file để tải lên vào nhóm học tập
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FileUploadArea
            onDrop={handleDrop}
            isDragActive={isDragActive}
            variant="file-with-answers"
          />

          <div>
            <Label htmlFor="folder-select">Thư mục</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn thư mục..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Thư mục gốc</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.folderName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {files.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-gray-700 text-sm">
              {files.map((file, idx) => (
                <li key={idx}>
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </li>
              ))}
            </ul>
          )}

          {isUploading && (
            <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
              <div
                className="h-2 bg-blue-500 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Hủy
          </Button>
          <Button onClick={uploadFiles} disabled={isUploading}>
            {isUploading ? `Đang tải lên ${uploadProgress}%` : "Tải lên"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
