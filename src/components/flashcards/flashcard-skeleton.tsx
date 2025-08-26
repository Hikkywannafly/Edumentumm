import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FlashcardSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export function FlashcardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <Card className="grid gap-4 border-none py-6 md:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <FlashcardSkeleton key={index} />
      ))}
    </Card>
  );
}
