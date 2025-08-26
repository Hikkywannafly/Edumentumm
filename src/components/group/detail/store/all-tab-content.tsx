"use client";

import { useEffect, useState } from "react";
import type { FolderResponse } from "../../../../types/folder";
import { Breadcrumb } from "./breadcrumb";
import { DocumentItem } from "./document-item";
import { FolderItem } from "./folder-item";
import type { ViewMode } from "./types";

interface AllTabContentProps {
  selectedFolder: string | null;
  folders: FolderResponse[];
  viewMode: ViewMode;
  onFolderSelect: (folderId: string) => void;
  onNavigateBack: () => void;
  onFileDeleted: (folderId: string, fileId: string) => void;
}

export function AllTabContent({
  selectedFolder,
  folders,
  viewMode,
  onFolderSelect,
  onNavigateBack,
  onFileDeleted,
}: AllTabContentProps) {
  const currentFolder = selectedFolder
    ? folders.find((f) => f.id === selectedFolder)
    : null;

  const [documents, setDocuments] = useState(currentFolder?.files ?? []);

  // cập nhật documents khi đổi folder
  useEffect(() => {
    if (currentFolder) {
      setDocuments(currentFolder.files);
    }
  }, [currentFolder]);

  return (
    <div className="space-y-4">
      <Breadcrumb
        selectedFolder={selectedFolder}
        folders={folders}
        onNavigateBack={onNavigateBack}
      />

      {!selectedFolder && (
        <div>
          <h3 className="mb-3 font-semibold text-lg">Thư mục</h3>
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
      )}

      {currentFolder && (
        <div>
          <h3 className="mb-3 font-semibold text-lg">
            Tài liệu trong "{currentFolder.folderName}"
          </h3>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-2"
            }
          >
            {documents.map((doc) => (
              <DocumentItem
                key={doc.id}
                document={doc}
                viewMode={viewMode}
                onDeleted={(fileId) => {
                  setDocuments((docs) => docs.filter((d) => d.id !== fileId));
                  if (currentFolder) {
                    onFileDeleted(currentFolder.id, fileId);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
