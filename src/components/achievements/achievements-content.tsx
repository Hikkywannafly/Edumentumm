"use client";

import {} from "@radix-ui/react-dropdown-menu";
import {} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect } from "react";
import useGetAllAchievement from "../../hooks/achievement/use-get-all-achievement";
import useGetSummaryAchievement from "../../hooks/achievement/use-get-sumary-achievement";
import { Skeleton } from "../ui/skeleton";
import { AchievementCard } from "./achievement-card";
import AchievementFilter from "./achievement-filter";
import AchievementPaging from "./achievement-paging";
import {
  AchievementCardSkeleton,
  StatsCardSkeleton,
} from "./achievement-skeleton";
import { StatsCard } from "./starts-card";

export const AchievementsContent = () => {
  const t = useTranslations("Achievements");
  const {
    achievements,
    paging,
    loading,
    keyword,
    setKeyword,
    setPage,
    rarity,
    setRarity,
    achieved,
    setAchieved,
  } = useGetAllAchievement();

  const { data, loading: loadingSummary } = useGetSummaryAchievement();

  const resetPage = useCallback(() => {
    setPage(0);
  }, [setPage]);

  useEffect(() => {
    resetPage();
  }, [resetPage]);

  const statsData: Array<{
    title: string;
    value: string;
    description: string;
    icon: "trophy" | "bolt" | "star" | "target";
    iconColor: string;
  }> = [
    {
      title: t("stats.totalUnlocked.title"),
      value: `${data?.totalUnlocked}/${data?.totalAchievements ?? 1}`,
      description: t("stats.totalUnlocked.description"),
      icon: "trophy",
      iconColor: "text-yellow-400",
    },
    {
      title: t("stats.xpEarned.title"),
      value: data?.totalXP.toString() || "0",
      description: t("stats.xpEarned.description"),
      icon: "bolt",
      iconColor: "text-blue-400",
    },
    {
      title: t("stats.rarestUnlocked.title"),
      value: "None yet",
      description: t("stats.rarestUnlocked.description"),
      icon: "star",
      iconColor: "text-purple-400",
    },
    {
      title: t("stats.recentProgress.title"),
      value: t("stats.recentProgress.description"),
      description: "",
      icon: "target",
      iconColor: "text-green-400",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <header className="mb-8">
        {/* {loading ? (
          <div>
            <Skeleton className="mb-2 h-10 w-1/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : (
          <>
            <h1 className="mb-2 font-bold text-3xl text-zinc-900 md:text-4xl dark:text-white">
              {t("title")}
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {t("description")}
            </p>
          </>
        )} */}
        <h1 className="mb-2 font-bold text-3xl text-zinc-900 md:text-4xl dark:text-white">
          {t("title")}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          {t("description")}
        </p>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingSummary
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))
          : statsData.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
                iconColor={stat.iconColor}
              />
            ))}
      </section>

      {loadingSummary ? (
        <div className="flex gap-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-56 rounded-md" />
          <Skeleton className="h-10 w-56 rounded-md" />
        </div>
      ) : (
        <AchievementFilter
          keyword={keyword}
          setKeyword={setKeyword}
          rarity={rarity}
          setRarity={setRarity}
          achieved={achieved}
          setAchieved={setAchieved}
        />
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <AchievementCardSkeleton key={i} />
            ))
          : achievements.map((achievement, index) => (
              <AchievementCard achievement={achievement} key={index} />
            ))}
      </section>
      {loading ? (
        <div className="mt-4 flex justify-center">
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
      ) : (
        <AchievementPaging
          pagination={paging || undefined}
          pageIndex={setPage}
        />
      )}
    </div>
  );
};
