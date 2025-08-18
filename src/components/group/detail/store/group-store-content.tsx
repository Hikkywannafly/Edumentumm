"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Folder } from "lucide-react";
import { useState } from "react";

import { AllTabContent } from "./all-tab-content";
import { CreateFolderDialog } from "./create-folder-dialog";
import { FoldersTabContent } from "./folders-tab-content";
import { GroupStoreHeader } from "./header";
import { RecentTabContent } from "./recent-tab-content";
import { SearchFilterBar } from "./search-filter-bar";
import type { Document, FolderType, ViewMode } from "./types";
import { UploadFileDialog } from "./upload-file-dialog";

export default function GroupStoreContent() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);

  // Mock data
  const folders: FolderType[] = [
    {
      id: "1",
      name: "Bài giảng tuần 1",
      description: "Tài liệu giới thiệu khóa học",
      createdBy: "Nguyễn Văn A",
      createdAt: "2024-01-15",
      documentCount: 5,
    },
    {
      id: "2",
      name: "Bài tập thực hành",
      description: "Các bài tập và ví dụ minh họa",
      createdBy: "Trần Thị B",
      createdAt: "2024-01-20",
      documentCount: 8,
    },
    {
      id: "3",
      name: "Tài liệu tham khảo",
      description: "Sách và tài liệu bổ sung",
      createdBy: "Lê Văn C",
      createdAt: "2024-01-25",
      documentCount: 12,
    },
  ];

  const documents: Document[] = [
    {
      id: "1",
      name: "Giới thiệu khóa học.pdf",
      type: "pdf",
      size: "2.5 MB",
      uploadedBy: "Nguyễn Văn A",
      uploadedAt: "2024-01-15",
      folderId: "1",
      description: "Tổng quan về nội dung khóa học",
    },
    {
      id: "2",
      name: "Bài giảng 1 - Cơ bản.pptx",
      type: "pptx",
      size: "4.2 MB",
      uploadedBy: "Nguyễn Văn A",
      uploadedAt: "2024-01-16",
      folderId: "1",
    },
    {
      id: "3",
      name: "Video hướng dẫn.mp4",
      type: "video",
      size: "25.8 MB",
      uploadedBy: "Trần Thị B",
      uploadedAt: "2024-01-18",
      folderId: "1",
    },
    {
      id: "4",
      name: "Bài tập số 1.docx",
      type: "docx",
      size: "1.2 MB",
      uploadedBy: "Trần Thị B",
      uploadedAt: "2024-01-20",
      folderId: "2",
    },
    {
      id: "5",
      name: "Đáp án bài tập.pdf",
      type: "pdf",
      size: "800 KB",
      uploadedBy: "Lê Văn C",
      uploadedAt: "2024-01-22",
      folderId: "2",
    },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder
      ? doc.folderId === selectedFolder
      : true;
    return matchesSearch && matchesFolder;
  });

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl space-y-6">
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
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Thư mục
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-2">
                  <Folder className="h-4 w-4" /> File
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-2">
                  <Folder className="h-4 w-4" /> Quiz
                </TabsTrigger>
                <TabsTrigger
                  value="recent1"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" /> FlashCard
                </TabsTrigger>
                <TabsTrigger
                  value="recent2"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" /> Gần đây
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <AllTabContent
                  selectedFolder={selectedFolder}
                  folders={filteredFolders}
                  documents={filteredDocuments}
                  viewMode={viewMode}
                  onFolderSelect={setSelectedFolder}
                  onNavigateBack={() => setSelectedFolder(null)}
                />
              </TabsContent>

              <TabsContent value="quiz" className="mt-4">
                <FoldersTabContent
                  folders={folders}
                  viewMode={viewMode}
                  onFolderSelect={setSelectedFolder}
                />
              </TabsContent>

              <TabsContent value="files" className="mt-4">
                <RecentTabContent documents={documents} />
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        <CreateFolderDialog
          open={isFolderDialogOpen}
          onOpenChange={setIsFolderDialogOpen}
        />

        <UploadFileDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          folders={folders}
        />
      </div>
    </div>
  );
}
