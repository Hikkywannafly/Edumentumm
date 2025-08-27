"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoriesService } from "@/lib/services/categories.service";
import { Bot, Plus, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";

interface QuizTagsCategoriesEditorProps {
  category?: string;
  onCategoryChange: (category: string) => void;
  tags?: string[];
  onTagsChange: (tags: string[]) => void;
  aiSelectedCategory?: string;
  aiGeneratedTags?: string[];
  showAISelections?: boolean;
}

export function QuizTagsCategoriesEditor({
  category = "",
  onCategoryChange,
  tags = [],
  onTagsChange,
  aiSelectedCategory,
  aiGeneratedTags = [],
  showAISelections = false,
}: QuizTagsCategoriesEditorProps) {
  const [newTag, setNewTag] = useState("");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categories = await categoriesService.getCategories();
        setAvailableCategories(categories);
      } catch (error) {
        console.error("Failed to load categories:", error);
        // Fallback to static categories
        setAvailableCategories([
          "Mathematics",
          "Science",
          "History",
          "Literature",
          "Technology",
          "Business",
          "Art",
          "Music",
          "Sports",
          "General Knowledge",
          "Language Learning",
          "Programming",
          "Medicine",
          "Engineering",
          "Psychology",
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Auto-apply AI selections when they become available
  useEffect(() => {
    if (showAISelections && aiSelectedCategory && !category) {
      onCategoryChange(aiSelectedCategory);
    }
  }, [aiSelectedCategory, category, onCategoryChange, showAISelections]);

  useEffect(() => {
    if (showAISelections && aiGeneratedTags.length > 0 && tags.length === 0) {
      onTagsChange(aiGeneratedTags);
    }
  }, [aiGeneratedTags, tags, onTagsChange, showAISelections]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      onTagsChange(updatedTags);
      setNewTag("");
    }
  };

  const handleApplyAICategory = () => {
    if (aiSelectedCategory) {
      onCategoryChange(aiSelectedCategory);
    }
  };

  const handleApplyAITags = () => {
    if (aiGeneratedTags.length > 0) {
      // Merge AI tags with existing tags, avoiding duplicates
      const mergedTags = [...new Set([...tags, ...aiGeneratedTags])];
      onTagsChange(mergedTags);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    onTagsChange(updatedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Quiz Tags & Category
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label className="font-medium text-sm">Category</Label>

          {/* AI Suggestion Banner */}
          {showAISelections &&
            aiSelectedCategory &&
            aiSelectedCategory !== category && (
              <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3">
                <Bot className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800 text-sm">
                  AI suggests: <strong>{aiSelectedCategory}</strong>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleApplyAICategory}
                  className="ml-auto h-7 px-2 text-xs"
                >
                  Apply
                </Button>
              </div>
            )}

          <Select
            value={category}
            onValueChange={onCategoryChange}
            disabled={isLoadingCategories}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  isLoadingCategories
                    ? "Loading categories..."
                    : "Select a category for this quiz"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags Management */}
        <div className="space-y-2">
          <Label className="font-medium text-sm">Tags</Label>
          <p className="text-muted-foreground text-xs">
            Add tags to help organize and categorize this quiz
          </p>

          {/* AI Generated Tags Banner */}
          {showAISelections && aiGeneratedTags.length > 0 && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Bot className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 text-sm">
                  AI generated tags:
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleApplyAITags}
                  className="ml-auto h-7 px-2 text-xs"
                >
                  Apply All
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {aiGeneratedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={tags.includes(tag) ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {tag}
                    {!tags.includes(tag) && (
                      <button
                        onClick={() => {
                          if (!tags.includes(tag)) {
                            onTagsChange([...tags, tag]);
                          }
                        }}
                        className="ml-1 hover:text-green-700"
                        type="button"
                        aria-label={`Add tag ${tag}`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Display existing tags */}
          {tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                    type="button"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Add new tag */}
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Suggested Tags */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">
            Suggested tags:
          </Label>
          <div className="flex flex-wrap gap-1">
            {[
              "cơ bản",
              "nâng cao",
              "ôn tập",
              "thực hành",
              "kiểm tra",
              "beginner",
              "intermediate",
              "advanced",
              "exam-prep",
              "practice",
              "review",
            ].map((suggestedTag) => (
              <Button
                key={suggestedTag}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => {
                  if (!tags.includes(suggestedTag)) {
                    onTagsChange([...tags, suggestedTag]);
                  }
                }}
                disabled={tags.includes(suggestedTag)}
              >
                {suggestedTag}
              </Button>
            ))}
          </div>
        </div>

        {/* Debug Info */}
        {/* {process.env.NODE_ENV === "development" && (
          <div className="mt-4 rounded bg-gray-100 p-2 text-gray-600 text-xs">
            <strong>Debug:</strong>
            <br />
            AI Category: {aiSelectedCategory || "None"}
            <br />
            AI Tags: [{aiGeneratedTags.join(", ")}]
            <br />
            Quiz Category: {quizData?.metadata?.category || "None"}
            <br />
            Quiz Metadata Tags: [
            {quizData?.metadata?.tags?.join(", ") || "None"}]
            <br />
            Question Tags: [
            {quizData?.questions
              ?.flatMap((q) => q.tags || [])
              .filter((tag, index, arr) => arr.indexOf(tag) === index)
              .join(", ") || "None"}
            ]
            <br />
            Current Tags: [{tags.join(", ") || "None"}]
            <br />
            Show AI: {showAISelections ? "Yes" : "No"}
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}
