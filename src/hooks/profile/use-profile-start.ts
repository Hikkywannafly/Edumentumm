import { Award, BarChart3, BookOpen, Clock, Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { type GetProfileResponse, profileAPI } from "../../lib/api/profile";

export function useProfileStart() {
  const [info, setInfo] = useState<GetProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    profileAPI
      .getProfile()
      .then((res) => {
        setInfo(res);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || "Failed to fetch profile");
        setInfo(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      title: "Study Streak",
      value: info?.streak ?? 0,
      subtitle: `Longest: ${info?.maxStreak ?? 0} days`,
      icon: Trophy,
      color: "text-orange-500",
    },
    {
      title: "Total Focus Time",
      value: info
        ? `${Math.floor((info.totalStudyTimeToday ?? 0) / 60)}h ${(info.totalStudyTimeToday ?? 0) % 60}m`
        : "0h 0m",
      subtitle: "Time spent studying",
      icon: Clock,
      color: "text-blue-500",
    },
    {
      title: "Level Progress",
      value: info
        ? `Level ${info.levelProgress?.replace("LEVEL_", "") ?? 1}`
        : "Level 1",
      subtitle: "100 XP",
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      title: "Attendance",
      value: info?.totalAttendance ?? 0,
      subtitle: "Total attendance days",
      icon: Award,
      color: "text-green-500",
    },
    {
      title: "Quizzes Created",
      value: info?.totalQuizzesCreated ?? 0,
      subtitle: "Total quizzes created",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Quizzes Completed",
      value: info?.totalQuizzesCompleted ?? 0,
      subtitle: "Total quizzes completed",
      icon: BookOpen,
      color: "text-pink-500",
    },
    {
      title: "Flashcards Created",
      value: info?.totalFlashCardCreated ?? 0,
      subtitle: "Total flashcards created",
      icon: BarChart3,
      color: "text-emerald-500",
    },
    {
      title: "Flashcards Mastered",
      value: info?.totalFlashCardCompleted ?? 0,
      subtitle: "Total flashcards mastered",
      icon: BarChart3,
      color: "text-purple-500",
    },
  ];

  return {
    stats,
    loading,
    error,
    info,
  };
}
