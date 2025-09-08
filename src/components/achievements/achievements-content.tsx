"use client";

import {} from "@radix-ui/react-dropdown-menu";
import {} from "lucide-react";
import { useTranslations } from "next-intl";
import useGetAllAchievement from "../../hooks/achievement/use-get-all-achievement";
import { AchievementCard } from "./achievement-card";
import AchievementFilter from "./achievement-filter";
import AchievementPaging from "./achievement-paging";
import { StatsCard } from "./starts-card";

export const AchievementsContent = () => {
  const t = useTranslations("Achievements");
  const { achievements } = useGetAllAchievement();

  const statsData: Array<{
    title: string;
    value: string;
    description: string;
    icon: "trophy" | "bolt" | "star" | "target";
    iconColor: string;
  }> = [
    {
      title: t("stats.totalUnlocked.title"),
      value: "0/26",
      description: t("stats.totalUnlocked.description"),
      icon: "trophy",
      iconColor: "text-yellow-400",
    },
    {
      title: t("stats.xpEarned.title"),
      value: "10",
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
        <h1 className="mb-2 font-bold text-3xl text-zinc-900 md:text-4xl dark:text-white">
          {t("title")}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          {t("description")}
        </p>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
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

      <AchievementFilter />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement, index) => (
          <AchievementCard achievement={achievement} key={index} />
        ))}
      </section>

      <AchievementPaging />
    </div>
  );
};
