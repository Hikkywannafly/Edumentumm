import { HtmlTitle } from "@/components/shared/editor/html-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Eye, Users } from "lucide-react";
import { LocalizedLink } from "../localized-link";

type ExploreCardProps = {
  title: string;
  questions: number;
  daysAgo: number;
  id: number;
  slug: string;
  attemptCount?: number;
  viewCount?: number;
  completionCount?: number;
};

export default function ExploreCard({
  title,
  questions,
  daysAgo,
  id,
  slug,
  attemptCount = 0,
  viewCount = 0,
  completionCount = 0,
}: ExploreCardProps) {
  const formatTimeDisplay = () => {
    if (daysAgo > 30) {
      return `${Math.floor(daysAgo / 30)} months ago`;
    }
    if (daysAgo > 0) {
      return `${daysAgo}d ago`;
    }
    return "Just now";
  };

  const formatPopularityNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <Card className="group relative h-full overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:bg-card hover:shadow-black/5 hover:shadow-sm dark:hover:shadow-black/20">
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <HtmlTitle
              content={title}
              as="h3"
              className="line-clamp-2 text-start font-semibold text-foreground text-lg leading-tight"
            />
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

        <div className="mb-3 flex flex-wrap gap-2">
          {attemptCount > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Users className="h-3 w-3" />
              <span>{formatPopularityNumber(attemptCount)}</span>
            </div>
          )}
          {viewCount > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Eye className="h-3 w-3" />
              <span>{formatPopularityNumber(viewCount)}</span>
            </div>
          )}
          {completionCount > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <CheckCircle className="h-3 w-3" />
              <span>{formatPopularityNumber(completionCount)}</span>
            </div>
          )}
        </div>

        <div className="mt-auto">
          <div className="flex flex-wrap justify-end gap-2 pt-4">
            <Button
              size="sm"
              className="h-8 justify-center gap-2 bg-blue-600 font-medium text-white text-xs hover:bg-blue-700"
              asChild
            >
              <LocalizedLink href={`/quizzes/${slug}-${id}`}>
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
