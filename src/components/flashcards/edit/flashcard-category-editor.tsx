"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  type FlashcardCategory,
  useCreateFlashcardCategory,
  useFlashcardCategories,
} from "@/hooks/flashcard/use-flashcard-categories";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

interface FlashcardCategoryEditorProps {
  categoryId?: number;
  onCategoryChange: (
    categoryId: number | undefined,
    categoryName: string,
  ) => void;
  aiGeneratedCategory?: string;
  showAISelection?: boolean;
}

export function FlashcardCategoryEditor({
  categoryId,
  onCategoryChange,
  aiGeneratedCategory,
  showAISelection = false,
}: FlashcardCategoryEditorProps) {
  const [open, setOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // React Query hooks
  const { data: availableCategories = [], isLoading: isLoadingCategories } =
    useFlashcardCategories();

  const createCategoryMutation = useCreateFlashcardCategory();

  // Find current category name from categoryId
  const currentCategory = availableCategories.find(
    (cat) => cat.id === categoryId,
  );

  // Apply AI generated category if available and no category is set
  useEffect(() => {
    if (showAISelection && aiGeneratedCategory && !categoryId) {
      // Find AI category by name to get its ID
      const aiCategory = availableCategories.find(
        (cat) => cat.name === aiGeneratedCategory,
      );
      if (aiCategory) {
        onCategoryChange(aiCategory.id, aiCategory.name);
      }
    }
  }, [
    aiGeneratedCategory,
    categoryId,
    onCategoryChange,
    showAISelection,
    availableCategories,
  ]);

  const handleCategorySelect = (selectedCategory: FlashcardCategory) => {
    onCategoryChange(selectedCategory.id, selectedCategory.name);
    setOpen(false);
    setShowCustomInput(false);
    setCustomCategory("");
  };

  const handleAddCustomCategory = async () => {
    if (customCategory.trim()) {
      const newCategoryName = customCategory.trim();

      try {
        // Create new category via API
        const newCategory = await createCategoryMutation.mutateAsync({
          name: newCategoryName,
          description: `Custom category: ${newCategoryName}`,
        });

        // Select the newly created category
        onCategoryChange(newCategory.id, newCategory.name);
        setCustomCategory("");
        setShowCustomInput(false);
        setOpen(false);
      } catch (error) {
        console.error("Failed to create category:", error);
        // On error, still allow local selection but without ID
        onCategoryChange(undefined, newCategoryName);
        setCustomCategory("");
        setShowCustomInput(false);
        setOpen(false);
      }
    }
  };

  const handleClearCategory = () => {
    onCategoryChange(undefined, "");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomCategory();
    }
  };

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Flashcard Category
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label className="font-medium text-sm">
            Choose a category to help organize your flashcard set
          </Label>

          {/* Current Category Display */}
          {currentCategory && (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="flex items-center gap-1">
                {currentCategory.name}
                <button
                  onClick={handleClearCategory}
                  className="ml-1 hover:text-red-500"
                  type="button"
                  aria-label="Remove category"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}

          {/* Category Selector */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {currentCategory?.name || "Select category..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search categories..." />
                <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>

                  {/* Available Categories */}
                  {availableCategories.length > 0 && (
                    <CommandGroup heading="Available Categories">
                      {availableCategories.map((availableCategory) => (
                        <CommandItem
                          key={availableCategory.id}
                          value={availableCategory.name}
                          onSelect={() =>
                            handleCategorySelect(availableCategory)
                          }
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              categoryId === availableCategory.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {availableCategory.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {/* Custom Category Input */}
                  <CommandGroup heading="Add Custom Category">
                    <CommandItem onSelect={() => setShowCustomInput(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add custom category
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Custom Category Input */}
          {showCustomInput && (
            <div className="flex gap-2 rounded-md border bg-muted/50 p-2">
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter custom category..."
                className="flex-1"
                autoFocus
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomCategory}
                disabled={!customCategory.trim()}
              >
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomCategory("");
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoadingCategories && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading categories...
          </div>
        )}

        {/* Creation Loading State */}
        {createCategoryMutation.isPending && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating category...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
