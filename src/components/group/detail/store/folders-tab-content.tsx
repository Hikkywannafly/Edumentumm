"use client";

import { Badge } from "@/components/ui/badge";
import type { FolderResponse } from "../../../../types/folder";
import { FolderItem } from "./folder-item";
import type { ViewMode } from "./types";

interface FoldersTabContentProps {
  folders: FolderResponse[];
  viewMode: ViewMode;
  onFolderSelect: (folderId: string) => void;
}

export function FoldersTabContent({
  folders,
  viewMode,
  onFolderSelect,
}: FoldersTabContentProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">All folders</h3>
        <Badge variant="secondary">{folders.length} folders</Badge>
      </div>
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            : "space-y-2"
        }
      >
        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            viewMode={viewMode}
            onClick={() => onFolderSelect(folder.id)}
          />
        ))}
      </div>
    </div>
  );
}
