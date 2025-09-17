"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseLevel, type ICourseFilter } from "@/types/course.type";
import { ChevronDown, Filter, Search } from "lucide-react";
import { useState } from "react";

interface CourseFilterProps {
  filter: ICourseFilter;
  onFilterChange: (filter: ICourseFilter) => void;
  availableTags?: string[];
}

const DEFAULT_TAGS = [
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Design",
  "DevOps",
];

export function CourseFilter({
  filter,
  onFilterChange,
  availableTags = DEFAULT_TAGS,
}: CourseFilterProps) {
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [isLevelOpen, setIsLevelOpen] = useState(false);

  const levels = [
    { value: CourseLevel.BEGINNER, label: "Beginner" },
    { value: CourseLevel.INTERMEDIATE, label: "Intermediate" },
    { value: CourseLevel.ADVANCED, label: "Advanced" },
  ];

  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "price", label: "Price" },
    { value: "level", label: "Level" },
  ] as const;

  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filter, search });
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    const newTags = checked
      ? [...filter.tags, tag]
      : filter.tags.filter((t) => t !== tag);

    onFilterChange({ ...filter, tags: newTags });

    // Close popover if we're removing items
    if (!checked && newTags.length === 0) {
      setIsTopicsOpen(false);
    }
  };

  const handleLevelChange = (level: string, checked: boolean) => {
    const newLevels = checked
      ? [...filter.level, level]
      : filter.level.filter((l) => l !== level);

    onFilterChange({ ...filter, level: newLevels });

    // Close popover if we're removing items
    if (!checked && newLevels.length === 0) {
      setIsLevelOpen(false);
    }
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      tags: [],
      level: [],
      sortBy: "popular",
    });
    setIsTopicsOpen(false);
    setIsLevelOpen(false);
  };

  const activeFiltersCount = filter.tags.length + filter.level.length;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={filter.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tags Filter */}
        <Popover open={isTopicsOpen} onOpenChange={setIsTopicsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="mr-2 h-4 w-4" />
              Tags
              {filter.tags.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                  {filter.tags.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-3">
              <h4 className="font-medium">Select Tags</h4>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {availableTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={filter.tags.includes(tag)}
                      onCheckedChange={(checked) =>
                        handleTagChange(tag, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`tag-${tag}`}
                      className="cursor-pointer font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {tag}
                    </label>
                  </div>
                ))}
              </div>

              {filter.tags.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFilterChange({ ...filter, tags: [] })}
                  className="w-full"
                >
                  Clear Tags
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Level Filter */}
        <Popover open={isLevelOpen} onOpenChange={setIsLevelOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              Level
              {filter.level.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                  {filter.level.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="start">
            <div className="space-y-3">
              <h4 className="font-medium">Select Level</h4>
              <div className="space-y-2">
                {levels.map((level) => (
                  <div
                    key={level.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`level-${level.value}`}
                      checked={filter.level.includes(level.value)}
                      onCheckedChange={(checked) =>
                        handleLevelChange(level.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`level-${level.value}`}
                      className="cursor-pointer font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {level.label}
                    </label>
                  </div>
                ))}
              </div>

              {filter.level.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFilterChange({ ...filter, level: [] })}
                  className="w-full"
                >
                  Clear Levels
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort */}
        <Select
          value={filter.sortBy}
          onValueChange={(value) =>
            onFilterChange({
              ...filter,
              sortBy: value as ICourseFilter["sortBy"],
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear All Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Filter Display */}
      {(filter.tags.length > 0 || filter.level.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {filter.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleTagChange(tag, false)}
            >
              {tag} ×
            </Badge>
          ))}
          {filter.level.map((level) => (
            <Badge
              key={level}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleLevelChange(level, false)}
            >
              {levels.find((l) => l.value === level)?.label || level} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
