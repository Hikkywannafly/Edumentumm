"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderOpen, UploadCloud } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { folderAPI } from "../../../../lib/api/folder";
import type { FileResponse, FolderResponse } from "../../../../types/folder";
import { FileUploadArea } from "../../../quizzes/create/file-upload-area";

interface UploadFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: FolderResponse[];
  onUploadSuccess?: (folderId: string, files: FileResponse[]) => void;
  defaultFolderId?: string; // Thêm dòng này
}

export function UploadFileDialog({
  open,
  onOpenChange,
  folders,
  onUploadSuccess,
  defaultFolderId = "root", // Giá trị mặc định là "root"
}: UploadFileDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [folderId, setFolderId] = useState<string>(defaultFolderId);
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
      console.error("Upload failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Có lỗi khi tải lên!",
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg overflow-hidden rounded-xl p-0">
        <DialogHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-5">
          <DialogDescription className="mt-1 text-blue-600">
            Choose file to upload
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          <FileUploadArea
            onDrop={handleDrop}
            isDragActive={isDragActive}
            variant="file-with-answers"
          />

          <div>
            <Label
              htmlFor="folder-select"
              className="mb-2 flex items-center gap-2 font-semibold"
            >
              <FolderOpen className="h-4 w-4 text-purple-600" />
              Folder
            </Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose folder..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Root folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.folderName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {files.length > 0 && (
            <ul className="mt-2 rounded-lg bg-blue-50 p-3 text-blue-700 text-sm shadow-inner">
              {files.map((file, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <UploadCloud className="h-4 w-4 text-blue-500" />
                  <span>{file.name}</span>
                  <span className="ml-auto text-gray-500 text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </li>
              ))}
            </ul>
          )}

          {isUploading && (
            <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
              <div
                className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 bg-gray-50 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
            className="font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={uploadFiles}
            disabled={isUploading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-white"
          >
            {isUploading ? `Uploading ${uploadProgress}%` : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
