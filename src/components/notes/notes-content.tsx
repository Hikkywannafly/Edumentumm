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
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import ThinLayout from "../layout/thin-layout";

export function NotesContent() {
  const t = useTranslations("Notes");
  const _tCommon = useTranslations("Common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State từ URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "updatedAt";
  const sortDir = searchParams.get("sortDir") || "desc";

  // State local
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isInitialized, setIsInitialized] = useState(false);

  // Pagination state
  const pageSize = 9;

  // Debounced search
  const debouncedSearch = useDebounce(searchInput, 500);

  // Store state
  const { isLoading, error, filter, setFilter, setSearchQuery } =
    useNoteStore();

  // Initialize component to prevent hydration mismatch
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Cập nhật URL khi search thay đổi
  useEffect(() => {
    // Skip during initial load to prevent hydration issues
    if (!isInitialized) return;

    // Skip if search hasn't actually changed
    if (searchQuery === debouncedSearch) return;

    const currentParams = new URLSearchParams(searchParams);
    const newParams = new URLSearchParams(searchParams);

    if (debouncedSearch) {
      newParams.set("search", debouncedSearch);
    } else {
      newParams.delete("search");
    }
    newParams.set("page", "1"); // Reset về trang 1 khi search

    // Only update URL if params actually changed
    if (currentParams.toString() !== newParams.toString()) {
      router.replace(`${pathname}?${newParams.toString()}`);
    }

    setSearchQuery(debouncedSearch);
  }, [
    debouncedSearch,
    router,
    pathname,
    searchParams,
    setSearchQuery,
    searchQuery,
    isInitialized,
  ]);

  // Cập nhật filter khi URL thay đổi (with debouncing to prevent excessive API calls)
  useEffect(() => {
    if (!isInitialized) return;

    const timeoutId = setTimeout(() => {
      setFilter({
        page: currentPage - 1,
        size: pageSize,
        query: searchQuery,
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [currentPage, searchQuery, setFilter, isInitialized]);

  // Fetch notes
  const { data, refetch } = useNoteList(filter);

  // Sắp xếp notes để đảm bảo note mới cập nhật hiển thị ở đầu (memoized)
  const sortedNotes = useMemo(() => {
    if (!data?.content) return [];

    return [...data.content].sort((a, b) => {
      if (sortBy === "updatedAt") {
        return sortDir === "desc"
          ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      if (sortBy === "createdAt") {
        return sortDir === "desc"
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "title") {
        return sortDir === "desc"
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [data?.content, sortBy, sortDir]);

  // Xử lý sắp xếp
  const handleSortChange = useCallback(
    (newSortBy: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("sortBy", newSortBy);
      params.set("sortDir", sortDir === "asc" ? "desc" : "asc");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, sortDir, router, pathname],
  );

  // Xử lý chuyển trang
  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(page));
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  // Xử lý refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Lấy locale từ pathname
  const locale = pathname.split("/")[1] || "vi";

  // Xử lý tạo note mới
  const handleCreateNote = useCallback(() => {
    router.push(`/${locale}/notes/create`);
  }, [router, locale]);

  // Xử lý click vào note
  const handleNoteClick = useCallback(
    (note: NoteData) => {
      // Thêm parameter mode để NoteEditor biết phải mở chế độ nào
      const mode = note.type === "markdown" ? "markdown" : "block";
      router.push(`/${locale}/notes/edit/${note.id}?mode=${mode}`);
    },
    [router, locale],
  );

  // Render note card
  const renderNoteCard = (note: NoteData) => (
    <Card
      key={note.id}
      className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md dark:border-border/50 dark:hover:shadow-lg"
      onClick={() => handleNoteClick(note)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h3 className="line-clamp-2 font-semibold text-lg dark:text-foreground">
              {note.title}
            </h3>
            <Badge
              variant={note.type === "markdown" ? "default" : "secondary"}
              className="text-xs dark:bg-muted/50"
            >
              {note.type === "markdown"
                ? t("stats.markdownMode")
                : t("editor.blockMode")}
            </Badge>
          </div>

          {/* Content preview */}
          <div className="line-clamp-3 text-muted-foreground text-sm dark:text-muted-foreground">
            {note.type === "markdown" && note.content
              ? note.content.substring(0, 150)
              : note.blocks && note.blocks.length > 0
                ? note.blocks
                    .slice(0, 2)
                    .map((block) => block.content?.text || "")
                    .join(" ")
                    .substring(0, 150)
                : t("emptyState.noContent")}
          </div>

          {/* Tags */}
          {note.tags &&
            note.tags.filter((tag) => tag !== "markdown" && tag !== "block")
              .length > 0 && (
              <div className="flex flex-wrap gap-1">
                {note.tags
                  .filter((tag) => tag !== "markdown" && tag !== "block")
                  .slice(0, 3)
                  .map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                {note.tags.filter(
                  (tag) => tag !== "markdown" && tag !== "block",
                ).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +
                    {note.tags.filter(
                      (tag) => tag !== "markdown" && tag !== "block",
                    ).length - 3}
                  </Badge>
                )}
              </div>
            )}

          {/* Footer */}
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(note.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>
                {note.type === "markdown"
                  ? t("stats.markdownMode")
                  : `${note.blocks?.length || 0} ${t("stats.blocks")}`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render note list item
  const renderNoteListItem = (note: NoteData) => (
    <Card
      key={note.id}
      className="cursor-pointer transition-all hover:shadow-sm"
      onClick={() => handleNoteClick(note)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="truncate font-semibold text-lg">{note.title}</h3>
              <Badge
                variant={note.type === "markdown" ? "default" : "secondary"}
                className="text-xs"
              >
                {note.type === "markdown"
                  ? t("stats.markdownMode")
                  : t("editor.blockMode")}
              </Badge>
            </div>
            <p className="mb-2 line-clamp-2 text-muted-foreground text-sm">
              {note.type === "markdown" && note.content
                ? note.content.substring(0, 100)
                : note.blocks && note.blocks.length > 0
                  ? note.blocks
                      .slice(0, 1)
                      .map((block) => block.content?.text || "")
                      .join(" ")
                      .substring(0, 100)
                  : t("emptyState.noContent")}
            </p>
            <div className="flex items-center gap-4 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(note.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>
                  {note.type === "markdown"
                    ? t("stats.markdownMode")
                    : `${note.blocks?.length || 0} ${t("stats.blocks")}`}
                </span>
              </div>
            </div>
          </div>
          {note.tags &&
            note.tags.filter((tag) => tag !== "markdown" && tag !== "block")
              .length > 0 && (
              <div className="ml-4 flex flex-wrap gap-1">
                {note.tags
                  .filter((tag) => tag !== "markdown" && tag !== "block")
                  .slice(0, 2)
                  .map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                {note.tags.filter(
                  (tag) => tag !== "markdown" && tag !== "block",
                ).length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +
                    {note.tags.filter(
                      (tag) => tag !== "markdown" && tag !== "block",
                    ).length - 2}
                  </Badge>
                )}
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <ThinLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <Button onClick={handleCreateNote} className="gap-2">
            <FileText className="h-4 w-4" />
            {t("actions.createNote")}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search.placeholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("sort.lastModified")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">
                {t("sort.lastModified")}
              </SelectItem>
              <SelectItem value="createdAt">{t("sort.dateCreated")}</SelectItem>
              <SelectItem value="title">{t("sort.title")}</SelectItem>
            </SelectContent>
          </Select>

          {/* View mode */}
          <div className="flex gap-1 rounded-md border p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Refresh */}
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
            <h3 className="mb-2 font-semibold text-lg">
              {t("errors.loadFailed")}
            </h3>
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("actions.retry")}
            </Button>
          </div>
        ) : isLoading ? (
          renderSkeleton()
        ) : !data?.content || data.content.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
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
              <Button onClick={handleCreateNote}>
                <FileText className="mr-2 h-4 w-4" />
                {t("actions.createNote")}
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Pagination controls - Top */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  variant="outline"
                  size="sm"
                  className="min-w-[80px]"
                >
                  Trước
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, data.totalPages) },
                    (_, i) => {
                      let pageNumber: number;
                      if (data.totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= data.totalPages - 2) {
                        pageNumber = data.totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          variant={
                            currentPage === pageNumber ? "default" : "outline"
                          }
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={isLoading}
                        >
                          {pageNumber}
                        </Button>
                      );
                    },
                  )}
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= data.totalPages || isLoading}
                  variant="outline"
                  size="sm"
                  className="min-w-[80px]"
                >
                  Sau
                </Button>
              </div>
            )}

            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                  : "space-y-4"
              }
            >
              {sortedNotes.map((note) =>
                viewMode === "grid"
                  ? renderNoteCard(note)
                  : renderNoteListItem(note),
              )}
            </div>

            {/* Pagination controls - Bottom */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  variant="outline"
                  size="sm"
                  className="min-w-[80px]"
                >
                  Trước
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, data.totalPages) },
                    (_, i) => {
                      let pageNumber: number;
                      if (data.totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= data.totalPages - 2) {
                        pageNumber = data.totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          variant={
                            currentPage === pageNumber ? "default" : "outline"
                          }
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={isLoading}
                        >
                          {pageNumber}
                        </Button>
                      );
                    },
                  )}
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= data.totalPages || isLoading}
                  variant="outline"
                  size="sm"
                  className="min-w-[80px]"
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}

        {/* Pagination info */}
        {data && data.content.length > 0 && (
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <div>
              Hiển thị {data.content.length} trong tổng số {data.totalElements}{" "}
              ghi chú
              {searchQuery && ` cho "${searchQuery}"`}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Trang {currentPage} trong tổng số {data.totalPages} trang
              </span>
            </div>
          </div>
        )}
      </div>
    </ThinLayout>
  );
}
