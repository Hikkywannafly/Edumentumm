"use client";
import { LocalizedLink } from "@/components/localized-link";
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
import { useFlashcardTotalStats } from "@/hooks/flashcard/use-flashcard-total-stats";
import { useFlashcardsQuery } from "@/hooks/flashcard/use-flashcards-query";
import { useDebounce } from "@/hooks/use-debounce";
import {
  AlertCircle,
  Grid3x3,
  List,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import ThinLayout from "../layout/thin-layout";
import { FlashcardGrid } from "./flashcard-grid";
import FlashcardPagination from "./flashcard-pagination";
import { FlashcardSkeletonGrid } from "./flashcard-skeleton";

export function FlashcardsContent() {
  const t = useTranslations("Flashcards");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get values from URL search params
  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "recent";
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Local state for search input (before debounce)
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Debounce search input to avoid too many API calls
  const debouncedSearch = useDebounce(searchInput, 500);

  const pageSize = 6;

  // Convert UI page (1-based) to API page (0-based)
  const apiPage = currentPage - 1;

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
      if ("search" in updates || "sortBy" in updates) {
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

  // Use React Query hooks with search and sort parameters
  const {
    data: flashcardsResponse,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFlashcardsQuery(apiPage, pageSize, searchQuery, sortBy);

  // Get total stats across all flashcards
  const { data: totalStats } = useFlashcardTotalStats();

  // Extract data with fallbacks
  const flashcardSets = flashcardsResponse?.data || [];
  const apiPagination = flashcardsResponse?.pagination;

  // Convert API pagination (0-based) to UI pagination (1-based)
  const pagination = useMemo(() => {
    if (!apiPagination) {
      return {
        currentPage: 1,
        pageSize: pageSize,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
    }

    return {
      ...apiPagination,
      currentPage: apiPagination.currentPage + 1,
    };
  }, [apiPagination]);

  // Calculate stats - use total stats for accurate counts across all pages
  const stats = {
    totalFlashcards: totalStats?.totalFlashcards || 0,
    totalDecks: totalStats?.totalDecks || 0,
    averageScore: totalStats?.averageScore || 0,
    studyTime: totalStats?.studyTime || "0h",
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() });
  };

  const handleSortChange = (newSortBy: string) => {
    updateSearchParams({ sortBy: newSortBy });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  // Show loading skeleton on initial load
  const isInitialLoad = isLoading && !flashcardsResponse;

  if (isInitialLoad) {
    return (
      <ThinLayout classNames="flex-1 space-y-6 p-6">
        {/* Search and Filters Skeleton */}
        <div className="flex gap-4">
          <div className="max-w-md flex-1">
            <div className="relative">
              <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="pl-8"
                disabled={isInitialLoad}
              />
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Flashcard Grid Skeleton */}
        <FlashcardSkeletonGrid count={6} />
      </ThinLayout>
    );
  }

  if (error) {
    return (
      <ThinLayout classNames="flex-1 space-y-6 p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 font-semibold text-lg">
            Error loading flashcards
          </h3>
          <p className="mb-4 text-muted-foreground">{error.message}</p>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      </ThinLayout>
    );
  }

  return (
    <ThinLayout classNames="flex-1 space-y-6 p-6">
      {/* Search and Filters */}
      <div className="flex w-full items-center gap-3">
        {/* Search Input - Takes most space */}
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-lg border-0 bg-muted/30 py-2.5 pr-4 pl-10 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring/30"
          />
        </div>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="h-10 w-[140px] rounded-lg border-0 bg-muted/30 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-lg bg-muted/30 p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 rounded-md p-0"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 rounded-md p-0"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Add Flashcard Button */}
        <LocalizedLink href="/flashcards/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Flashcard
          </Button>
        </LocalizedLink>

        {/* Background refresh indicator */}
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Updating...
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="font-medium text-muted-foreground text-sm">
                {t("stats.totalFlashcards")}
              </p>
              <p className="font-bold text-2xl">{stats.totalFlashcards}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="font-medium text-muted-foreground text-sm">
                {t("stats.totalDecks")}
              </p>
              <p className="font-bold text-2xl">{stats.totalDecks}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="font-medium text-muted-foreground text-sm">
                {t("stats.averageScore")}
              </p>
              <p className="font-bold text-2xl">{stats.averageScore}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="font-medium text-muted-foreground text-sm">
                {t("stats.studyTime")}
              </p>
              <p className="font-bold text-2xl">{stats.studyTime}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flashcard Grid or Create CTA */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl">{t("yourFlashcards")}</h2>
          </div>
          {/* Pagination - Show even during loading */}
          <FlashcardPagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
          {/* Show skeleton only for flashcard grid */}
          <FlashcardSkeletonGrid count={6} />
        </div>
      ) : flashcardSets.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl">{t("yourFlashcards")}</h2>
          </div>
          {/* Pagination */}
          <FlashcardPagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
          <FlashcardGrid flashcardSets={flashcardSets} />
        </div>
      ) : (
        /* Create CTA Card */
        <Card className="border-2 border-dashed">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">{t("createCTA.title")}</h3>
                <p className="text-muted-foreground text-sm">
                  {t("createCTA.description")}
                </p>
              </div>
              <LocalizedLink href="flashcards/create">
                <Button>{t("createCTA.button")}</Button>
              </LocalizedLink>
            </div>
          </CardContent>
        </Card>
      )}
    </ThinLayout>
  );
}
