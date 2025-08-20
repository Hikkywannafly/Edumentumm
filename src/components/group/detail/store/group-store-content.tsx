"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import { folderAPI } from "../../../../lib/api/folder";
import type { FileResponse, FolderResponse } from "../../../../types/folder";
import { AllTabContent } from "./all-tab-content";
import { CreateFolderDialog } from "./create-folder-dialog";
import { GroupStoreHeader } from "./header";
import { SearchFilterBar } from "./search-filter-bar";
import type { ViewMode } from "./types";
import { UploadFileDialog } from "./upload-file-dialog";

export default function GroupStoreContent({ id }: { id: string }) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);

  const [folders, setFolders] = useState<FolderResponse[]>([]);

  const handleFolderCreated = (newFolder: FolderResponse) => {
    const folderData: FolderResponse = {
      id: newFolder.id,
      ownerId: newFolder.ownerId,
      ownerName: newFolder.ownerName,
      folderName: newFolder.folderName || "Folder mới",
      createdAt: newFolder.createdAt || new Date().toISOString(),
      files: [],
    };

    setFolders((prev) => [folderData, ...prev]);
    setSelectedFolder(folderData.id);
    setSearchQuery("");
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await folderAPI.getFolder(id);
        setFolders(res);
      } catch (error) {
        console.error("Failed to fetch folders:", error);
      }
    };

    if (id) {
      fetchGroups();
    }
  }, [id]);

  const filteredFolders = folders.filter((folder) =>
    (folder.folderName || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleUploadSuccess = (
    folderId: string,
    uploadedFiles: FileResponse[],
  ) => {
    // Ensure uploadedFiles is an array
    const files = Array.isArray(uploadedFiles)
      ? uploadedFiles
      : [uploadedFiles];

    if (folderId === "root") {
      setFolders((prev) => {
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
      });
      return;
    }

    setFolders((prev) =>
      prev.map((folder) => {
        if (folder.id === folderId) {
          return {
            ...folder,
            files: [...folder.files, ...files],
          };
        }
        return folder;
      }),
    );
  };

  const handleFileDeleted = (folderId: string, fileId: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? { ...folder, files: folder.files.filter((f) => f.id !== fileId) }
          : folder,
      ),
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <GroupStoreHeader
          onCreateFolder={() => setIsFolderDialogOpen(true)}
          onUploadFile={() => setIsUploadDialogOpen(true)}
        />

        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <Card>
          <CardHeader>
            <Tabs defaultValue="folders" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="folders"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" /> Thư mục
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Gần đây
                </TabsTrigger>
              </TabsList>

              <TabsContent value="folders" className="mt-4">
                <AllTabContent
                  selectedFolder={selectedFolder}
                  folders={filteredFolders}
                  viewMode={viewMode}
                  onFolderSelect={setSelectedFolder}
                  onNavigateBack={() => setSelectedFolder(null)}
                  onFileDeleted={handleFileDeleted}
                />
              </TabsContent>

              {/* <TabsContent value="recent" className="mt-4">
                <RecentTabContent documents={documents} />
              </TabsContent> */}
            </Tabs>
          </CardHeader>
        </Card>

        <CreateFolderDialog
          groupId={id}
          onSuccess={handleFolderCreated}
          open={isFolderDialogOpen}
          onOpenChange={setIsFolderDialogOpen}
        />

        <UploadFileDialog
          onUploadSuccess={handleUploadSuccess}
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          folders={folders}
        />
      </div>
    </div>
  );
}
