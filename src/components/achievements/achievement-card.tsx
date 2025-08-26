import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Bolt } from "lucide-react";

interface AchievementCardProps {
  icon: string;
  title: string;
  tier: string;
  description: string;
  xp: number;
  progressCurrent?: number;
  progressTotal?: number;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
}

export function AchievementCard({
  icon,
  title,
  tier,
  description,
  xp,
  progressCurrent,
  progressTotal,
  rarity,
}: AchievementCardProps) {
  const showProgress =
    progressCurrent !== undefined && progressTotal !== undefined;
  const progressValue = showProgress
    ? (progressCurrent / progressTotal) * 100
    : 0;

  // ánh xạ màu rarity cho light và dark mode
  const rarityColorClass = {
    COMMON: "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300",
    RARE: "bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200",
    EPIC: "bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-200",
    LEGENDARY:
      "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200",
  };

  return (
    <Card className="flex flex-col border-gray-300 bg-white text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center rounded-md bg-zinc-100 p-2 text-2xl shadow-sm transition dark:bg-zinc-700">
            {icon}
          </span>
          <div>
            <CardTitle className="font-semibold text-base">{title}</CardTitle>
            <p className="text-gray-600 text-xs dark:text-zinc-400">{tier}</p>
          </div>
        </div>
        <div className="flex items-center font-medium text-gray-700 text-sm dark:text-zinc-300">
          <Bolt className="mr-1 h-4 w-4 text-blue-600 dark:text-blue-400" />
          {xp}
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col justify-between">
        <p className="mb-4 text-gray-600 text-sm dark:text-zinc-400">
          {description}
        </p>
        {showProgress && (
          <div className="mb-2 space-y-2">
            <Progress
              value={progressValue}
              className="h-2 bg-zinc-300 dark:bg-zinc-700 [&>*]:bg-blue-600 dark:[&>*]:bg-blue-500"
            />
            <p className="text-gray-600 text-xs dark:text-zinc-400">
              Progress: {progressCurrent}/{progressTotal}
            </p>
          </div>
        )}
        <span
          className={cn(
            "inline-flex w-fit cursor-pointer items-center rounded-full px-2.5 py-0.5 font-medium text-xs transition hover:brightness-95",
            rarityColorClass[rarity],
          )}
        >
          {rarity.charAt(0) + rarity.slice(1).toLowerCase()}
        </span>
      </CardContent>
    </Card>
  );
}
