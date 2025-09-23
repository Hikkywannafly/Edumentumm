"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface Tag {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface TopicExplorationProps {
  tags: Tag[];
  onTopicSelect: (tagId: number) => void;
  selectedTagId?: number;
}

export default function TopicExploration({
  tags,
  onTopicSelect,
  selectedTagId,
}: TopicExplorationProps) {
  const groupedTags = [
    {
      category: "Academic Subjects",
      tags: tags.filter((tag) =>
        [
          "mathematics",
          "science",
          "literature",
          "history",
          "geography",
          "physics",
          "chemistry",
          "biology",
        ].includes(tag.name.toLowerCase()),
      ),
    },
    {
      category: "Languages",
      tags: tags.filter((tag) =>
        [
          "english",
          "vietnamese",
          "chinese",
          "japanese",
          "korean",
          "french",
          "spanish",
          "german",
        ].includes(tag.name.toLowerCase()),
      ),
    },
    {
      category: "Professional Skills",
      tags: tags.filter((tag) =>
        [
          "programming",
          "design",
          "marketing",
          "business",
          "finance",
          "medicine",
          "law",
        ].includes(tag.name.toLowerCase()),
      ),
    },
    {
      category: "Hobbies & Interests",
      tags: tags.filter((tag) =>
        [
          "music",
          "art",
          "sports",
          "cooking",
          "travel",
          "photography",
          "gaming",
        ].includes(tag.name.toLowerCase()),
      ),
    },
  ].filter((group) => group.tags.length > 0);

  return (
    <div className="space-y-8">
      {groupedTags.map((group) => (
        <div key={group.category} className="space-y-4">
          <h2 className="font-bold text-foreground text-xl">
            {group.category}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {group.tags.map((tag) => (
              <Card
                key={tag.id}
                className={`group relative cursor-pointer overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:bg-card hover:shadow-black/5 hover:shadow-sm dark:hover:shadow-black/20 ${
                  selectedTagId === tag.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => onTopicSelect(tag.id)}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">
                      {tag.name}
                    </h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-muted-foreground text-sm">
                    {tag.description ||
                      `Explore quizzes related to ${tag.name}`}
                  </p>
                  <div className="mt-3">
                    <Badge variant="secondary" className="text-xs">
                      Topic
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Show all tags if not categorized */}
      {groupedTags.length === 0 && tags.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tags.map((tag) => (
            <Card
              key={tag.id}
              className={`group relative cursor-pointer overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:bg-card hover:shadow-black/5 hover:shadow-sm dark:hover:shadow-black/20 ${
                selectedTagId === tag.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onTopicSelect(tag.id)}
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{tag.name}</h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-2 line-clamp-2 text-muted-foreground text-sm">
                  {tag.description || `Explore quizzes related to ${tag.name}`}
                </p>
                <div className="mt-3">
                  <Badge variant="secondary" className="text-xs">
                    Topic
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tags.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No topics available</p>
        </div>
      )}
    </div>
  );
}
