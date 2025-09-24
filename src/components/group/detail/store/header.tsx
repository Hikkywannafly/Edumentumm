"use client";

import { Button } from "@/components/ui/button";
import { Folder, Share2Icon, Upload } from "lucide-react";

interface HeaderProps {
  onCreateFolder: () => void;
  onUploadFile: () => void;
  onShareQuiz: () => void;
}

export function GroupStoreHeader({
  onCreateFolder,
  onUploadFile,
  onShareQuiz,
}: HeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-bold text-2xl text-gray-900 dark:text-white">
          Manager Store
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload and manage documents, lectures in the group
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCreateFolder}>
          <Folder className="mr-2 h-4 w-4" />
          Create Folder
        </Button>
        <Button variant="outline" onClick={onShareQuiz}>
          <Share2Icon className="mr-2 h-4 w-4" />
          Share Quiz,FlashCard
        </Button>
        <Button onClick={onUploadFile}>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>
    </div>
  );
}
