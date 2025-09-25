import { useCallback, useEffect, useState } from "react";
import { folderAPI } from "../../lib/api/folder";
import type { FileResponse, FolderResponse } from "../../types/folder";

const folderCache = new Map<string, FolderResponse[]>();

export function useFolders(publicId: string) {
  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      if (!publicId) return;

      if (folderCache.has(publicId)) {
        const cachedFolders = folderCache.get(publicId);
        if (cachedFolders) {
          setFolders(cachedFolders);
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const res = await folderAPI.getFolder(publicId);
        setFolders(res);
        folderCache.set(publicId, res);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch folders"),
        );
        console.error("Failed to fetch folders:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
  }, [publicId]);

  const handleFolderCreated = useCallback(
    (newFolder: FolderResponse) => {
      const folderData: FolderResponse = {
        id: newFolder.id,
        ownerId: newFolder.ownerId,
        ownerName: newFolder.ownerName,
        folderName: newFolder.folderName || "Folder mới",
        createdAt: newFolder.createdAt || new Date().toISOString(),
        files: [],
        quiz: [],
      };

      setFolders((prev) => {
        const updated = [folderData, ...prev];
        folderCache.set(publicId, updated);
        return updated;
      });
      return folderData.id;
    },
    [publicId],
  );

  const handleUploadSuccess = useCallback(
    (folderId: string, uploadedFiles: FileResponse[]) => {
      const files = Array.isArray(uploadedFiles)
        ? uploadedFiles
        : [uploadedFiles];

      setFolders((prev) => {
        let updated: FolderResponse[];
        if (folderId === "root") {
          const rootFolder = prev.find((f) => f.id === "root");
          const rootFiles = rootFolder?.files || [];
          updated = [
            {
              id: "root",
              folderName: "Root",
              files: [...rootFiles, ...files],
              ownerId: "",
              ownerName: "",
              createdAt: new Date().toISOString(),
              quiz: [],
            },
            ...prev.filter((f) => f.id !== "root"),
          ];
        } else {
          updated = prev.map((folder) =>
            folder.id === folderId
              ? { ...folder, files: [...folder.files, ...files] }
              : folder,
          );
        }
        folderCache.set(publicId, updated);
        return updated;
      });
    },
    [publicId],
  );

  const handleFileDeleted = useCallback(
    (folderId: string, fileId: string) => {
      setFolders((prev) => {
        const updated = prev.map((folder) =>
          folder.id === folderId
            ? { ...folder, files: folder.files.filter((f) => f.id !== fileId) }
            : folder,
        );
        folderCache.set(publicId, updated);
        return updated;
      });
    },
    [publicId],
  );

  return {
    folders,
    isLoading,
    error,
    handleFolderCreated,
    handleUploadSuccess,
    handleFileDeleted,
  };
}
