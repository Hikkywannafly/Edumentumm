"use client";
import {} from "lucide-react";
import { useEffect, useState } from "react";
import { convertToDisplayData } from "../../../../hooks/quiz/use-quiz-list";
import type { FolderResponse } from "../../../../types/folder";
import { QuizCard } from "../../../quizzes";
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
  const [quizzes, setQuizzes] = useState(currentFolder?.quiz ?? []);

  useEffect(() => {
    if (currentFolder) {
      setDocuments(currentFolder.files);
      setQuizzes(currentFolder.quiz ?? []);
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
            Tài liệu & Quiz trong "{currentFolder.folderName}"
          </h3>
          <div className="space-y-6">
            {/* Tài liệu */}
            {documents.length > 0 && (
              <div>
                <h4 className="mb-2 font-semibold text-base text-blue-700">
                  Tài liệu
                </h4>
                <div
                  text-
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
                        setDocuments((docs) =>
                          docs.filter((d) => d.id !== fileId),
                        );
                        if (currentFolder) {
                          onFileDeleted(currentFolder.id, fileId);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {quizzes.length > 0 && (
              <div>
                <h4 className="mb-2 font-semibold text-base text-purple-700">
                  Quiz
                </h4>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                      : "space-y-2"
                  }
                >
                  {quizzes.map((quiz) => (
                    <QuizCard key={quiz.id} quiz={convertToDisplayData(quiz)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
