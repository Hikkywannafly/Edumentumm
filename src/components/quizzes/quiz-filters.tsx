"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuizFiltersProps } from "@/types/quiz-display";
import { Filter, Search } from "lucide-react";

export function QuizFilters({
  onSearch,
  onFilter,
  searchPlaceholder = "Search quizzes...",
  filtersLabel = "Filters",
}: QuizFiltersProps) {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(event.target.value);
    }
  };

  const handleFilterClick = () => {
    if (onFilter) {
      onFilter();
    }
  };

  return (
    <div className="flex gap-4">
      <div className="max-w-md flex-1">
        <div className="relative">
          <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-8"
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <Button
        variant="outline"
        className="flex items-center gap-2 bg-transparent"
        onClick={handleFilterClick}
      >
        <Filter className="h-4 w-4" />
        {filtersLabel}
      </Button>
    </div>
  );
}
