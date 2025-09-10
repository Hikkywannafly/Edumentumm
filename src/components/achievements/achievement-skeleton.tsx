import { Skeleton } from "../ui";

export function AchievementCardSkeleton() {
  return (
    <div className="flex min-h-[120px] flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm dark:bg-zinc-800">
      <Skeleton className="mb-2 h-6 w-1/2" />
      <Skeleton className="mb-1 h-4 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-2 h-2 w-full rounded-full" />
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="flex min-h-[100px] flex-col gap-2 rounded-lg border bg-white p-4 shadow-sm dark:bg-zinc-800">
      <Skeleton className="mb-2 h-6 w-1/3" />
      <Skeleton className="mb-1 h-8 w-1/4" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
