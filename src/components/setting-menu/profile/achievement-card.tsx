import {} from "@/components/ui/card";
import {} from "lucide-react";

interface AchievementProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
}

export function AchievementCard({
  icon,
  title,
  subtitle,
  color,
}: AchievementProps) {
  return (
    <div
      className={`flex flex-col items-center rounded-sm bg-gradient-to-b from-${color}-50 to-white p-3 shadow-sm transition hover:shadow-md`}
    >
      <div className={`mb-2 rounded-full bg-${color}-200 p-2`}>{icon}</div>
      <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-100">
        {title}
      </span>
      <span className="text-[11px] text-zinc-500 dark:text-zinc-300">
        {subtitle}
      </span>
    </div>
  );
}
