"use client";

import { LocalizedLink } from "@/components/localized-link";
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
import { Grid3X3, List, Plus, Search } from "lucide-react";
import { useState } from "react";

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
    <div className="flex w-full items-center justify-between gap-4">
      {/* Left side - Search */}
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-border/50 bg-background py-2.5 pr-4 pl-10 focus-visible:ring-1"
            onChange={handleSearchChange}
          />
        </div>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[140px] border border-border/50 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="difficulty">Difficulty</SelectItem>
            <SelectItem value="questions">Questions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Right side - View controls and Create button */}
      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <div className="flex items-center rounded-md border border-border/50 bg-background p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 rounded-sm p-0"
            onClick={() => handleViewModeChange("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 rounded-sm p-0"
            onClick={() => handleViewModeChange("table")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Create Quiz Button */}
        <LocalizedLink href="/quizzes/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Quiz
          </Button>
        </LocalizedLink>
      </div>
    </div>
  );
}
