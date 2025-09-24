import { useCallback, useState } from "react";
import type { ViewMode } from "../../components/group/detail/store/types";

export function useStoreUI() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isShareQuizDialogOpen, setIsShareQuizDialogOpen] = useState(false);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSort = useCallback((sort: string) => {
    setSortBy(sort);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const toggleUploadDialog = useCallback(() => {
    setIsUploadDialogOpen((prev) => !prev);
  }, []);

  const toggleFolderDialog = useCallback(() => {
    setIsFolderDialogOpen((prev) => !prev);
  }, []);

  const toggleShareQuizDialog = useCallback(() => {
    setIsShareQuizDialogOpen((prev) => !prev);
  }, []);

  const handleFolderSelect = useCallback((folderId: string | null) => {
    setSelectedFolder(folderId);
    setSearchQuery("");
  }, []);

  return {
    viewMode,
    selectedFolder,
    searchQuery,
    sortBy,
    isUploadDialogOpen,
    isFolderDialogOpen,
    isShareQuizDialogOpen,
    toggleShareQuizDialog,
    handleSearch,
    handleSort,
    handleViewModeChange,
    toggleUploadDialog,
    toggleFolderDialog,
    handleFolderSelect,
  };
}
