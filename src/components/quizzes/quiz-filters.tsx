"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QuizFiltersProps } from "@/types/quiz-display";
import { Grid3X3, List, Search } from "lucide-react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { LocalizedLink } from "../localized-link";
interface ExtendedQuizFiltersProps extends QuizFiltersProps {
  viewMode?: "grid" | "table";
  onViewModeChange?: (mode: "grid" | "table") => void;
  onSortChange?: (sortBy: string) => void;
}

export function QuizFilters({
  onSearch,
  searchPlaceholder = "Search quizzes...",
  viewMode = "grid",
  onViewModeChange,
  onSortChange,
}: ExtendedQuizFiltersProps) {
  const [sortBy, setSortBy] = useState("title");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(event.target.value);
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    if (onSortChange) {
      onSortChange(value);
    }
  };

  const handleViewModeChange = (mode: "grid" | "table") => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  return (
    <div className="flex w-full items-center gap-3">
      {/* Search Input - Takes most space */}
      <div className="relative flex-1">
        <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border-0 bg-muted/30 py-2.5 pr-4 pl-10 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring/30"
          onChange={handleSearchChange}
        />
      </div>

      {/* Sort Dropdown */}
      <Select value={sortBy} onValueChange={handleSortChange}>
        <SelectTrigger className="h-10 w-[140px] rounded-lg border-0 bg-muted/30 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="title">Title</SelectItem>
          <SelectItem value="created">Created</SelectItem>
          <SelectItem value="difficulty">Difficulty</SelectItem>
          <SelectItem value="questions">Questions</SelectItem>
        </SelectContent>
      </Select>

      {/* View Mode Toggle */}
      <div className="flex items-center rounded-lg bg-muted/30 p-1">
        <Button
          variant={viewMode === "grid" ? "default" : "ghost"}
          size="sm"
          className="h-8 w-8 rounded-md p-0"
          onClick={() => handleViewModeChange("grid")}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "table" ? "default" : "ghost"}
          size="sm"
          className="h-8 w-8 rounded-md p-0"
          onClick={() => handleViewModeChange("table")}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      <LocalizedLink href="/quizzes/create">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Quiz
        </Button>
      </LocalizedLink>
    </div>
  );
}
