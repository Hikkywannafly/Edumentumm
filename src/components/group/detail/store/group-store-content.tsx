"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, FileText } from "lucide-react";
import { useFolders } from "../../../../hooks/folder/use-folder";
import { useStoreUI } from "../../../../hooks/folder/use-store-ui";
import { AllTabContent } from "./all-tab-content";
import { CreateFolderDialog } from "./create-folder-dialog";
import { GroupStoreHeader } from "./header";
import { SearchFilterBar } from "./search-filter-bar";
import { UploadFileDialog } from "./upload-file-dialog";

export default function GroupStoreContent({ id }: { id: string }) {
  const {
    viewMode,
    selectedFolder,
    searchQuery,
    sortBy,
    isUploadDialogOpen,
    isFolderDialogOpen,
    handleSearch,
    handleSort,
    handleViewModeChange,
    toggleUploadDialog,
    toggleFolderDialog,
    handleFolderSelect,
    toggleShareQuizDialog,
  } = useStoreUI();

  const {
    folders,
    error,
    handleFolderCreated,
    handleUploadSuccess,
    handleFileDeleted,
  } = useFolders(id);

  const filteredFolders = folders.filter((folder) =>
    (folder.folderName || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <GroupStoreHeader
          onCreateFolder={toggleFolderDialog}
          onUploadFile={toggleUploadDialog}
          onShareQuiz={toggleShareQuizDialog}
        />

        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          sortBy={sortBy}
          onSortChange={handleSort}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />

        {error && (
          <div className="py-4 text-center text-red-500">{error.message}</div>
        )}

        <Card>
          <CardHeader>
            <Tabs defaultValue="folders" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="folders"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" /> Folders
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Recent
                </TabsTrigger>
              </TabsList>

              <TabsContent value="folders" className="mt-4">
                <AllTabContent
                  selectedFolder={selectedFolder}
                  folders={filteredFolders}
                  viewMode={viewMode}
                  onFolderSelect={handleFolderSelect}
                  onNavigateBack={() => handleFolderSelect(null)}
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
          onOpenChange={toggleFolderDialog}
        />

        <UploadFileDialog
          onUploadSuccess={handleUploadSuccess}
          open={isUploadDialogOpen}
          onOpenChange={toggleUploadDialog}
          folders={folders}
        />
      </div>
    </div>
  );
}
