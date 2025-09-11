"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNoteList } from "@/hooks/note";
import { useDebounce } from "@/hooks/use-debounce";
import { useNoteStore } from "@/stores/note-store";
import type { NoteData } from "@/types/note";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  Grid3x3,
  List,
  RefreshCw,
  Search,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ThinLayout from "../layout/thin-layout";

export function NotesContent() {
  const t = useTranslations("Notes");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL state
  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "updatedAt";
  const sortDir = searchParams.get("sortDir") || "desc";

  // Local state
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Store state
  const { filter, setFilter } = useNoteStore();

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  const pageSize = 12;
  const apiPage = currentPage - 1; // Convert to 0-based for API

  // Update search params in URL
  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }

      // Reset to page 1 when search or sort changes
      if ("search" in updates || "sortBy" in updates || "sortDir" in updates) {
        newSearchParams.set("page", "1");
      }

      const newUrl = `${pathname}?${newSearchParams.toString()}`;
      router.push(newUrl, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      updateSearchParams({ search: debouncedSearch });
    }
  }, [debouncedSearch, searchQuery, updateSearchParams]);

  // Sync search input with URL on mount
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Update store filter
  useEffect(() => {
    setFilter({
      page: apiPage,
      size: pageSize,
      query: searchQuery,
      sortBy,
      sortDir: sortDir as "asc" | "desc",
    });
  }, [apiPage, searchQuery, sortBy, sortDir, setFilter]);

  // Fetch notes
  const {
    data: notesResponse,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useNoteList(filter);

  // Extract data
  const notes = notesResponse?.content || [];
  const pagination = notesResponse
    ? {
        currentPage: notesResponse.page + 1, // Convert to 1-based
        totalPages: notesResponse.totalPages,
        totalElements: notesResponse.totalElements,
        hasNext: !notesResponse.last,
        hasPrevious: !notesResponse.first,
      }
    : null;

  // Event handlers
  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() });
  };

  const handleSortChange = (newSortBy: string) => {
    updateSearchParams({ sortBy: newSortBy });
  };

  const handleSortDirectionChange = (newSortDir: string) => {
    updateSearchParams({ sortDir: newSortDir });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleRefresh = () => {
    refetch();
  };

  // Show loading skeleton on initial load
  const isInitialLoad = isLoading && !notesResponse;

  if (isInitialLoad) {
    return (
      <ThinLayout classNames="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </ThinLayout>
    );
  }

  if (error) {
    return (
      <ThinLayout classNames="space-y-6">
        <Card className="border-destructive">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-destructive">
                {t("errors.loadFailed")}: {error.message}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("actions.retry")}
            </Button>
          </CardContent>
        </Card>
      </ThinLayout>
    );
  }

  return (
    <ThinLayout classNames="space-y-6">
      {/* Stats Section */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-bold text-2xl">
                  {pagination?.totalElements || 0}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t("stats.totalNotes")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-bold text-2xl">
                  {
                    notes.filter((note) => {
                      if (!note.updatedAt) return false;
                      const lastWeek = new Date();
                      lastWeek.setDate(lastWeek.getDate() - 7);
                      return new Date(note.updatedAt) > lastWeek;
                    }).length
                  }
                </p>
                <p className="text-muted-foreground text-sm">
                  {t("stats.recentlyUpdated")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-bold text-2xl">
                  {notes.filter((note) => note.ownerId).length}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t("stats.myNotes")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative max-w-sm flex-1">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("search.placeholder")}
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters and View Controls */}
            <div className="flex items-center gap-2">
              {/* Sort by */}
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt">
                    {t("sort.lastModified")}
                  </SelectItem>
                  <SelectItem value="createdAt">
                    {t("sort.dateCreated")}
                  </SelectItem>
                  <SelectItem value="title">{t("sort.title")}</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort direction */}
              <Select value={sortDir} onValueChange={handleSortDirectionChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">{t("sort.desc")}</SelectItem>
                  <SelectItem value="asc">{t("sort.asc")}</SelectItem>
                </SelectContent>
              </Select>

              {/* View mode toggle */}
              <div className="flex rounded-lg border">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      {notes.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">
              {searchQuery
                ? t("emptyState.noResults")
                : t("emptyState.noNotes")}
            </h3>
            <p className="mb-4 text-muted-foreground">
              {searchQuery
                ? t("emptyState.noResultsDescription")
                : t("emptyState.createFirst")}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push(`${pathname}/create`)}>
                {t("actions.createNote")}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} viewMode="list" />
              ))}
            </div>
          )}

          {/* Simple Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    Showing {(pagination.currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(
                      pagination.currentPage * pageSize,
                      pagination.totalElements,
                    )}{" "}
                    of {pagination.totalElements} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={!pagination.hasPrevious}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={!pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </ThinLayout>
  );
}

// Simple Note Card Component
function NoteCard({
  note,
  viewMode = "grid",
}: {
  note: NoteData;
  viewMode?: "grid" | "list";
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    router.push(`${pathname}/${note.id}`);
  };

  const getPreview = (blocks: any[]) => {
    if (!blocks || !Array.isArray(blocks)) return "";

    for (const block of blocks) {
      // Check for blocks with text content
      if (block.content?.text && typeof block.content.text === "string") {
        const text = block.content.text.trim();
        if (text.length > 0) {
          return text.substring(0, 150);
        }
      }
    }
    return "";
  };

  if (viewMode === "list") {
    return (
      <Card
        className="cursor-pointer transition-shadow hover:shadow-md"
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="truncate font-semibold text-lg">{note.title}</h3>
              <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
                {getPreview(note.blocks)}
              </p>
              <div className="mt-2 flex items-center gap-4 text-muted-foreground text-xs">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {note.updatedAt
                    ? formatDistanceToNow(new Date(note.updatedAt), {
                        addSuffix: true,
                      })
                    : "Unknown"}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {Array.isArray(note.blocks) ? note.blocks.length : 0} blocks
                </span>
              </div>
            </div>
            <div className="ml-4 flex flex-col items-end gap-2">
              <Badge variant={note.isPublic ? "default" : "secondary"}>
                {note.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="line-clamp-2 font-semibold text-lg">{note.title}</h3>
            <Badge variant={note.isPublic ? "default" : "secondary"}>
              {note.isPublic ? "Public" : "Private"}
            </Badge>
          </div>

          <p className="line-clamp-3 text-muted-foreground text-sm">
            {getPreview(note.blocks)}
          </p>

          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {note.updatedAt
                ? formatDistanceToNow(new Date(note.updatedAt), {
                    addSuffix: true,
                  })
                : "Unknown"}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {Array.isArray(note.blocks) ? note.blocks.length : 0} blocks
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
