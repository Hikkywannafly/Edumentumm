"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { mockTopics } from "@/lib/mock-data/courses";
import type { ICourseFilter as CourseFilterType } from "@/types/course.type";
import { ChevronDown, Filter } from "lucide-react";
import { useState } from "react";

interface CourseFilterProps {
  filter: CourseFilterType;
  onFilterChange: (filter: CourseFilterType) => void;
}

export function CourseFilter({ filter, onFilterChange }: CourseFilterProps) {
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [isLevelOpen, setIsLevelOpen] = useState(false);

  const levels = [
    { value: "basic", label: "Cơ bản" },
    { value: "intermediate", label: "Trung bình" },
    { value: "advanced", label: "Nâng cao" },
  ];

  const sortOptions = [
    { value: "newest", label: "Mới nhất" },
    { value: "popular", label: "Phổ biến" },
    { value: "level", label: "Theo cấp độ" },
  ];

  const handleTopicChange = (topic: string, checked: boolean) => {
    const newTopics = checked
      ? [...filter.topics, topic]
      : filter.topics.filter((t) => t !== topic);

    onFilterChange({ ...filter, topics: newTopics });
  };

  const handleLevelChange = (level: string, checked: boolean) => {
    const newLevels = checked
      ? [...filter.level, level]
      : filter.level.filter((l) => l !== level);

    onFilterChange({ ...filter, level: newLevels });
  };

  const clearFilters = () => {
    onFilterChange({
      search: filter.search,
      topics: [],
      level: [],
      sortBy: "newest",
    });
  };

  const activeFiltersCount = filter.topics.length + filter.level.length;

  return (
    <div className="flex items-center gap-2">
      {/* Topics Filter */}
      <Popover open={isTopicsOpen} onOpenChange={setIsTopicsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative bg-transparent">
            <Filter className="mr-2 h-4 w-4" />
            Chủ đề
            {filter.topics.length > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                {filter.topics.length}
              </Badge>
            )}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-2">
            <h4 className="font-medium">Chọn chủ đề</h4>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {mockTopics.map((topic) => (
                <div key={topic} className="flex items-center space-x-2">
                  <Checkbox
                    id={`topic-${topic}`}
                    checked={filter.topics.includes(topic)}
                    onCheckedChange={(checked) =>
                      handleTopicChange(topic, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`topic-${topic}`}
                    className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {topic}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Level Filter */}
      <Popover open={isLevelOpen} onOpenChange={setIsLevelOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative bg-transparent">
            Cấp độ
            {filter.level.length > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                {filter.level.length}
              </Badge>
            )}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48" align="start">
          <div className="space-y-2">
            <h4 className="font-medium">Chọn cấp độ</h4>
            <div className="space-y-2">
              {levels.map((level) => (
                <div key={level.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`level-${level.value}`}
                    checked={filter.level.includes(level.value)}
                    onCheckedChange={(checked) =>
                      handleLevelChange(level.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`level-${level.value}`}
                    className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {level.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Sort */}
      <Select
        value={filter.sortBy}
        onValueChange={(value) =>
          onFilterChange({
            ...filter,
            sortBy: value as CourseFilterType["sortBy"],
          })
        }
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Xóa bộ lọc ({activeFiltersCount})
        </Button>
      )}
    </div>
  );
}
