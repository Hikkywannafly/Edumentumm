import { Card, CardContent } from "@/components/ui/card";
import type { FlashcardSet } from "@/types/flashcard";
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
    <Card className="cursor-pointer transition hover:shadow-md">
      <CardContent className="p-4">
        <LocalizedLink href={`/flashcards/${flashcardSet.id}`}>
          <p className="text-muted-foreground text-sm">
            {formatTimeAgo(flashcardSet.createdAt)}
          </p>
          <h3 className="mt-1 font-semibold">
            {stripHtml(flashcardSet.title)}
          </h3>
          <p className="mt-1 text-muted-foreground text-sm">
            {flashcardSet.flashcards.length} flashcards
          </p>
          <p className="mt-1 text-muted-foreground text-xs">
            by {flashcardSet.user?.username || "Anonymous"}
          </p>
        </LocalizedLink>
      </CardContent>
    </Card>
  );
}
