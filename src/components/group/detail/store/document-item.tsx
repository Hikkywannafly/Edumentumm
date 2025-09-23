"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import {
  File,
  FileAudio,
  FileImage,
  FileSliders,
  FileSpreadsheet,
  FileText,
  FileVideo,
} from "lucide-react";
import { toast } from "sonner";
import { folderAPI } from "../../../../lib/api/folder";
import { type FileResponse, FileType } from "../../../../types/folder";
import type { ViewMode } from "./types";

export function getFileIcon(fileType: FileType) {
  switch (fileType) {
    case FileType.PDF:
    case FileType.DOC:
    case FileType.DOCX:
      return <FileText className="h-6 w-6 text-red-500" />;
    case FileType.XLS:
    case FileType.XLSX:
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    case FileType.PPT:
    case FileType.PPTX:
      return <FileSliders className="h-6 w-6 text-orange-500" />;
    case FileType.TXT:
      return <FileText className="h-6 w-6 text-gray-500" />;
    case FileType.IMAGE_JPG:
    case FileType.IMAGE_PNG:
    case FileType.IMAGE_GIF:
      return <FileImage className="h-6 w-6 text-blue-500" />;
    case FileType.VIDEO_MP4:
    case FileType.VIDEO_MKV:
      return <FileVideo className="h-6 w-6 text-purple-500" />;
    case FileType.AUDIO_MP3:
    case FileType.AUDIO_WAV:
      return <FileAudio className="h-6 w-6 text-pink-500" />;
    case FileType.ZIP:
    case FileType.RAR:
      return <File className="h-6 w-6 text-yellow-500" />;
    default:
      return <File className="h-6 w-6 text-gray-400" />;
  }
}

interface DocumentItemProps {
  document: FileResponse;
  viewMode: ViewMode;
  onDeleted?: (fileId: string) => void;
}

export function DocumentItem({
  document,
  viewMode,
  onDeleted,
}: DocumentItemProps) {
  const handleDelete = async () => {
    try {
      await folderAPI.deleteFile(document.id);
      toast.success("Delete successfully");
      onDeleted?.(document.id);
    } catch (err: any) {
      console.log(err);
    }
  };

  return (
    <>
      <div
        className={`group relative rounded-lg border border-gray-200 p-3 transition-all hover:bg-gray-50 hover:shadow-lg dark:border-gray-700 dark:hover:bg-gray-800 ${
          viewMode === "list"
            ? "flex items-center gap-3"
            : "flex flex-col items-start gap-2"
        }`}
      >
        <div className="flex w-full items-center gap-3">
          {getFileIcon(document.fileType)}
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-medium text-sm">
              {document.filename}
            </h4>
            <p className="mt-0.5 text-gray-500 text-xs dark:text-gray-400">
              {document.fileSize} • {document.ownerName}
            </p>
            <p className="text-[10px] text-gray-400">{document.createdAt}</p>
          </div>
        </div>

        <div
          className={`flex gap-2 ${
            viewMode === "grid"
              ? "mt-2"
              : "ml-auto opacity-0 transition-opacity group-hover:opacity-100"
          }`}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-1"
            onClick={() => {
              if (
                document.fileType === FileType.PDF ||
                document.fileType === FileType.DOC ||
                document.fileType === FileType.DOCX
              ) {
                // Mở file trực tiếp trên tab mới
                const url =
                  document.fileType === FileType.PDF
                    ? document.fileUrl
                    : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                        document.fileUrl,
                      )}`;
                window.open(url, "_blank", "noopener,noreferrer");
              } else {
                window.open(document.fileUrl, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 p-1">
            <Download className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 p-1">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="flex items-center gap-2 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}
