"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tag } from "@/types/quiz";
import { Bot, Plus, Tag as TagIcon, X } from "lucide-react";
import { useEffect, useState } from "react";

const getTagName = (tag: Tag): string => {
  return typeof tag === "string" ? tag : tag.name;
};

const includesTag = (tags: Tag[], tagName: string): boolean => {
  return tags.some((tag) => getTagName(tag) === tagName);
};

const tagsToStringArray = (tags: Tag[]): string[] => {
  return tags.map(getTagName);
};

const addStringTag = (tags: Tag[], newTag: string): Tag[] => {
  if (!includesTag(tags, newTag)) {
    return [...tags, newTag];
  }
  return tags;
};

const removeTag = (tags: Tag[], tagName: string): Tag[] => {
  return tags.filter((tag) => getTagName(tag) !== tagName);
};

interface QuizTagsEditorProps {
  tags?: Tag[];
  onTagsChange: (tags: string[]) => void;
  aiGeneratedTags?: string[];
  showAISelections?: boolean;
}

export function QuizTagsEditor({
  tags = [],
  onTagsChange,
  aiGeneratedTags = [],
  showAISelections = false,
}: QuizTagsEditorProps) {
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (showAISelections && aiGeneratedTags.length > 0 && tags.length === 0) {
      onTagsChange(aiGeneratedTags);
    }
  }, [aiGeneratedTags, tags, onTagsChange, showAISelections]);

  const handleAddTag = () => {
    if (newTag.trim() && !includesTag(tags, newTag.trim())) {
      const updatedTags = addStringTag(tags, newTag.trim());
      onTagsChange(tagsToStringArray(updatedTags));
      setNewTag("");
    }
  };

  const handleApplyAITags = () => {
    if (aiGeneratedTags.length > 0) {
      // Merge AI tags with existing tags, avoiding duplicates
      let mergedTags = [...tags];
      for (const tag of aiGeneratedTags) {
        if (!includesTag(mergedTags, tag)) {
          mergedTags = addStringTag(mergedTags, tag);
        }
      }
      onTagsChange(tagsToStringArray(mergedTags));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = removeTag(tags, tagToRemove);
    onTagsChange(tagsToStringArray(updatedTags));
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
          <TagIcon className="h-5 w-5" />
          Tags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
                    variant={includesTag(tags, tag) ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {tag}
                    {!includesTag(tags, tag) && (
                      <button
                        onClick={() => {
                          if (!includesTag(tags, tag)) {
                            const updatedTags = addStringTag(tags, tag);
                            onTagsChange(tagsToStringArray(updatedTags));
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
              {tags.map((tag, index) => {
                const tagName = getTagName(tag);
                const tagColor =
                  typeof tag === "object" && tag.color ? tag.color : undefined;
                return (
                  <Badge
                    key={`${tagName}-${index}`}
                    variant="secondary"
                    className="flex items-center gap-1"
                    style={
                      tagColor
                        ? {
                            backgroundColor: `${tagColor}20`,
                            borderColor: tagColor,
                            color: tagColor,
                          }
                        : {}
                    }
                  >
                    {tagName}
                    <button
                      onClick={() => handleRemoveTag(tagName)}
                      className="ml-1 hover:text-red-500"
                      type="button"
                      aria-label={`Remove tag ${tagName}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
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
                  if (!includesTag(tags, suggestedTag)) {
                    const updatedTags = addStringTag(tags, suggestedTag);
                    onTagsChange(tagsToStringArray(updatedTags));
                  }
                }}
                disabled={includesTag(tags, suggestedTag)}
              >
                {suggestedTag}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
