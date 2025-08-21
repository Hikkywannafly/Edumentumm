"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, FolderOpen, MoreHorizontal, Trash2 } from "lucide-react";
import type { FolderResponse } from "../../../../types/folder";
import type { ViewMode } from "./types";

interface FolderItemProps {
  folder: FolderResponse;
  viewMode: ViewMode;
  onClick: () => void;
}

export function FolderItem({ folder, viewMode, onClick }: FolderItemProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:bg-gray-50 hover:shadow-lg dark:border-gray-700 dark:hover:bg-gray-800 ${
        viewMode === "list" ? "flex items-center gap-4" : "flex flex-col gap-2"
      }`}
    >
      <div className="flex items-center gap-3">
        <FolderOpen className="h-6 w-6 text-blue-500" />
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold text-sm">
            {folder.folderName}
          </h4>
          <p className="mt-1 text-gray-500 text-xs dark:text-gray-400">
            {`Tạo bởi ${folder.ownerName} • ${new Date(
              folder.createdAt,
            ).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}`}
          </p>
        </div>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 p-1">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
