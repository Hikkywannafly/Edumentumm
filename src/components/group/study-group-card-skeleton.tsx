import { Card, Skeleton } from "../ui";

export function StudyGroupCardSkeleton() {
  return (
    <Card className="flex h-[200px] w-full min-w-[250px] max-w-2xl flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-1/2 min-w-[100px] rounded" />
        <Skeleton className="h-5 w-16 min-w-[64px] rounded" />
      </div>
      {/* Description skeleton */}
      <Skeleton className="mt-2 h-4 w-3/4 min-w-[120px] rounded" />
      <Skeleton className="mt-1 h-4 w-2/3 min-w-[80px] rounded" />
      {/* Footer skeleton */}
      <div className="mt-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 min-w-[16px] rounded-full" />
            <Skeleton className="h-4 w-16 min-w-[64px] rounded" />
          </div>
          <Skeleton className="h-5 w-14 min-w-[56px] rounded-full" />
        </div>
        <Skeleton className="h-2 w-full min-w-[120px] rounded-full" />
      </div>
    </Card>
  );
}
