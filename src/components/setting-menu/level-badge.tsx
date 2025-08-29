import { Badge } from "@/components/ui/badge";

type LevelBadgeProps = {
  level: string | number;
  className?: string;
};

const levelColors: Record<string, string> = {
  "1": "bg-gray-200 text-gray-800",
  "2": "bg-blue-200 text-blue-800",
  "3": "bg-green-200 text-green-800",
  "4": "bg-yellow-200 text-yellow-800",
  "5": "bg-orange-200 text-orange-800",
  "6": "bg-pink-200 text-pink-800",
  "7": "bg-purple-200 text-purple-800",
  "8": "bg-red-200 text-red-800",
  "9": "bg-teal-200 text-teal-800",
  "10": "bg-indigo-200 text-indigo-800",
};

export function LevelBadge({ level, className = "" }: LevelBadgeProps) {
  const color = levelColors[String(level)] || "bg-gray-200 text-gray-800";
  return (
    <Badge variant="secondary" className={`${color} ${className}`}>
      Level {level}
    </Badge>
  );
}
