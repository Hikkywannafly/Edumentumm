import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FlashcardSet } from "@/types/flashcard";
import { ArrowRight } from "lucide-react";
import { LocalizedLink } from "../localized-link";

type FlashcardExploreCardProps = {
  flashcardSet: FlashcardSet;
};

export default function FlashcardExploreCard({
  flashcardSet,
}: FlashcardExploreCardProps) {
  // Strip HTML tags from title
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "");
  };

  // Format time ago with proper units
  const formatTimeAgo = (dateString: string) => {
    const now = new Date().getTime();
    const date = new Date(dateString).getTime();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12)
      return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
  };

  return (
    <Card className="group relative h-full overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:bg-card hover:shadow-black/5 hover:shadow-sm dark:hover:shadow-black/20">
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <h3 className="line-clamp-2 text-start font-semibold text-foreground text-lg leading-tight">
              {stripHtml(flashcardSet.title)}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <span>{flashcardSet.flashcards.length} flashcards</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <span>{formatTimeAgo(flashcardSet.createdAt)}</span>
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              by {flashcardSet.user?.username || "Anonymous"}
            </p>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex flex-wrap justify-end gap-2 pt-4">
            <Button
              size="sm"
              className="h-8 justify-center gap-2 bg-blue-600 font-medium text-white text-xs hover:bg-blue-700"
              asChild
            >
              <LocalizedLink href={`/flashcards/${flashcardSet.id}`}>
                <ArrowRight className="h-4 w-4" />
                <span>Study</span>
              </LocalizedLink>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
