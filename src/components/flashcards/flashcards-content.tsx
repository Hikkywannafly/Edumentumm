"use client";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFlashcards } from "@/hooks/use-flashcards";
import { AlertCircle, Filter, Loader2, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ThinLayout from "../layout/thin-layout";
import { FlashcardGrid } from "./flashcard-grid";
import FlashcardPagination from "./flashcard-pagination";

export function FlashcardsContent() {
  const t = useTranslations("Flashcards");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const { flashcardSets, pagination, stats, isLoading, error, refetch } =
    useFlashcards(currentPage, pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refetch(page, pageSize);
  };

  if (isLoading) {
    return (
      <ThinLayout classNames="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading flashcards...</span>
          </div>
        </div>
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
          <p className="mb-4 text-muted-foreground">{error}</p>
          <Button onClick={() => refetch(currentPage, pageSize)}>
            Try again
          </Button>
        </div>
      </ThinLayout>
    );
  }

  return (
    <ThinLayout classNames="flex-1 space-y-6 p-6">
      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="max-w-md flex-1">
          <div className="relative">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("searchPlaceholder")} className="pl-8" />
          </div>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-transparent"
        >
          <Filter className="h-4 w-4" />
          {t("filters")}
        </Button>
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
      {flashcardSets.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl">{t("yourFlashcards")}</h2>
          </div>
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
      {/* Pagination */}
      {flashcardSets.length > 0 && (
        <FlashcardPagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
    </ThinLayout>
  );
}
