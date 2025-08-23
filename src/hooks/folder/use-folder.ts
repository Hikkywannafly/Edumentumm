import { useCallback, useEffect, useState } from "react";
import { folderAPI } from "../../lib/api/folder";
import type { FileResponse, FolderResponse } from "../../types/folder";

export function useFolders(groupId: string) {
  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      if (!groupId) return;

      setIsLoading(true);
      setError(null);
      try {
        const res = await folderAPI.getFolder(groupId);
        setFolders(res);
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
  }, [groupId]);

  const handleFolderCreated = useCallback((newFolder: FolderResponse) => {
    const folderData: FolderResponse = {
      id: newFolder.id,
      ownerId: newFolder.ownerId,
      ownerName: newFolder.ownerName,
      folderName: newFolder.folderName || "Folder mới",
      createdAt: newFolder.createdAt || new Date().toISOString(),
      files: [],
    };

    setFolders((prev) => [folderData, ...prev]);
    return folderData.id;
  }, []);

  const handleUploadSuccess = useCallback(
    (folderId: string, uploadedFiles: FileResponse[]) => {
      const files = Array.isArray(uploadedFiles)
        ? uploadedFiles
        : [uploadedFiles];

      setFolders((prev) => {
        if (folderId === "root") {
          const rootFolder = prev.find((f) => f.id === "root");
          const rootFiles = rootFolder?.files || [];

          return [
            {
              id: "root",
              folderName: "Root",
              files: [...rootFiles, ...files],
              ownerId: "",
              ownerName: "",
              createdAt: new Date().toISOString(),
            },
            ...prev.filter((f) => f.id !== "root"),
          ];
        }

        return prev.map((folder) =>
          folder.id === folderId
            ? { ...folder, files: [...folder.files, ...files] }
            : folder,
        );
      });
    },
    [],
  );

  const handleFileDeleted = useCallback((folderId: string, fileId: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? { ...folder, files: folder.files.filter((f) => f.id !== fileId) }
          : folder,
      ),
    );
  }, []);

  return {
    folders,
    isLoading,
    error,
    handleFolderCreated,
    handleUploadSuccess,
    handleFileDeleted,
  };
}
