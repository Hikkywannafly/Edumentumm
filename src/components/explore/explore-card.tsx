import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { LocalizedLink } from "../localized-link";

type ExploreCardProps = {
  title: string;
  questions: number;
  daysAgo: number;
  id: number;
  slug: string;
};

export default function ExploreCard({
  title,
  questions,
  daysAgo,
  id,
  slug,
}: ExploreCardProps) {
  // Format the time display similar to QuizCard
  const formatTimeDisplay = () => {
    if (daysAgo > 30) {
      return `${Math.floor(daysAgo / 30)} months ago`;
    }
    if (daysAgo > 0) {
      return `${daysAgo}d ago`;
    }
    return "Just now";
  };

  return (
    <Card className="group relative h-full overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:bg-card hover:shadow-black/5 hover:shadow-sm dark:hover:shadow-black/20">
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <h3 className="line-clamp-2 text-start font-semibold text-foreground text-lg leading-tight">
              {title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <span>{questions} questions</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <span>{formatTimeDisplay()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex flex-wrap justify-end gap-2 pt-4">
            <Button
              size="sm"
              className="h-8 justify-center gap-2 bg-blue-600 font-medium text-white text-xs hover:bg-blue-700"
              asChild
            >
              <LocalizedLink href={`/quizzes/${slug || id}`}>
                <ArrowRight className="h-4 w-4" />
                <span>Take Quiz</span>
              </LocalizedLink>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
