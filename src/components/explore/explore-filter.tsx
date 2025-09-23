"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Clock, Plus, Search, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Card } from "../ui";

type Tag = {
  id: number;
  name: string;
  slug: string;
  description: string;
};

type ExploreFilterProps = {
  tab: string;
  onTabChange: (value: string) => void;
  tags?: Tag[];
  selectedTagIds?: number[];
  onTagFilterChange?: (tagIds: number[]) => void;
  tagsLoading?: boolean;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
};

export default function ExploreFilter({
  tab,
  onTabChange,
  tags = [],
  selectedTagIds = [],
  onTagFilterChange = () => {},
  tagsLoading = false,
  onSearchChange = () => {},
  searchQuery = "",
}: ExploreFilterProps) {
  const [sortBy, setSortBy] = useState("newest");
  const [open, setOpen] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  // Filter tags based on search query
  const filteredTags = useMemo(() => {
    if (!tagSearchQuery) return tags;
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase()),
    );
  }, [tags, tagSearchQuery]);

  const selectedTags = useMemo(() => {
    return tags.filter((tag) => selectedTagIds.includes(tag.id));
  }, [tags, selectedTagIds]);

  const handleTagToggle = useCallback(
    (tagId: number) => {
      const newSelectedTagIds = selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId];

      onTagFilterChange(newSelectedTagIds);
    },
    [selectedTagIds, onTagFilterChange],
  );

  const handleSearchChange = (query: string) => {
    onSearchChange(query);
  };

  const handleRemoveTag = (tagId: number) => {
    const newSelectedTagIds = selectedTagIds.filter((id) => id !== tagId);
    onTagFilterChange(newSelectedTagIds);
  };

  return (
    <Card className="w-full border-none py-6">
      <div className="flex w-full flex-col gap-4">
        {/* Tabs - Full Width */}
        <Tabs value={tab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="quizzes"
              className="w-full dark:data-[state=active]:bg-blue-500"
            >
              Quizzes
            </TabsTrigger>
            <TabsTrigger
              value="flashcards"
              className="w-full dark:data-[state=active]:bg-blue-500"
            >
              Flashcards
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search + Sort - Full Width Responsive */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Input - Takes most space */}
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-full rounded-lg border-0 bg-muted/30 py-2.5 pr-4 pl-10 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring/30"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-10 w-full rounded-lg border-0 bg-muted/30 text-sm sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Newest
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Oldest
                  </div>
                </SelectItem>
                <SelectItem value="title-a-z">Title A-Z</SelectItem>
                <SelectItem value="title-z-a">Title Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags Filter - Only show for quizzes tab */}
        {tab === "quizzes" && (
          <div className="flex flex-col gap-2">
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-xs"
                  >
                    <span className="mr-1 text-primary">{tag.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.id)}
                      className="rounded-full p-0.5 transition-colors duration-150 hover:bg-primary/20"
                    >
                      <X className="h-2.5 w-2.5 text-primary" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tag Combobox */}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 w-full justify-between rounded-md border-0 bg-muted/30 py-1.5 text-xs hover:bg-muted/40"
                >
                  <span className="text-muted-foreground">
                    {selectedTags.length > 0
                      ? `${selectedTags.length} tag${selectedTags.length > 1 ? "s" : ""} selected`
                      : "Select tags..."}
                  </span>
                  <Plus className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search tags..."
                    value={tagSearchQuery}
                    onValueChange={setTagSearchQuery}
                    className="h-10 text-sm"
                  />
                  <CommandList>
                    <CommandEmpty className="p-3 text-sm">
                      No tags found.
                    </CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {tagsLoading ? (
                        <div className="p-2">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="mt-1 h-6 w-full" />
                          <Skeleton className="mt-1 h-6 w-full" />
                        </div>
                      ) : (
                        filteredTags.map((tag) => (
                          <CommandItem
                            key={tag.id}
                            onSelect={() => {
                              handleTagToggle(tag.id);
                              setOpen(false);
                            }}
                            className="flex items-center py-2.5 text-sm"
                          >
                            <div
                              className={cn(
                                "mr-2 h-4 w-4 rounded-full border",
                                selectedTagIds.includes(tag.id)
                                  ? "bg-primary"
                                  : "border-muted-foreground",
                              )}
                            >
                              {selectedTagIds.includes(tag.id) && (
                                <div className="h-full w-full rounded-full bg-primary" />
                              )}
                            </div>
                            {tag.name}
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </Card>
  );
}
