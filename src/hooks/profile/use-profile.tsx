import { format, subDays } from "date-fns";
import { Award, BarChart3, BookOpen, Clock, Trophy, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "../../contexts/auth-context";
import { useProfileAttendance } from "./use-profile-attendance";
import { useProfileInfo } from "./use-profile-info";

const today = new Date();
const weekDays = Array.from({ length: 7 }).map((_, idx) =>
  format(subDays(today, idx), "dd/MM"),
);
const getDaysInMonth = (y: number, m: number) =>
  new Date(y, m + 1, 0).getDate();
const getFirstDayOfWeek = (y: number, m: number) => {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
};

export function useProfile() {
  const { user } = useAuth();
  const displayName = user?.username || user?.email || "User";
  const today = new Date();
  const [calendar, setCalendar] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const { info } = useProfileInfo();
  const { attendanceDates } = useProfileAttendance();

  // Calendar logic
  const { year, month } = calendar;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);
  const daysArray = useMemo(
    () => [
      ...Array(firstDayOfWeek).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ],
    [daysInMonth, firstDayOfWeek],
  );

  const stats = [
    {
      title: "Study Streak",
      value: info?.streak ?? 0,
      subtitle: "Longest: 0 days",
      icon: Trophy,
      color: "text-orange-500",
    },
    {
      title: "Total Focus Time",
      value: `${Math.floor((info?.totalStudyTimeToday ?? 0) / 60)}h ${
        (info?.totalStudyTimeToday ?? 0) % 60
      }m`,
      subtitle: "Time spent studying",
      icon: Clock,
      color: "text-blue-500",
    },
    {
      title: "Level Progress",
      value: `Level ${info?.levelProgress?.replace("LEVEL_", "") ?? 1}`,
      subtitle: `${info?.totalStudyTimeToday ?? 0}/100 XP`,
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

  const productivityData = [
    { name: "Mon", time: 60, focus: 80 },
    { name: "Tue", time: 45, focus: 60 },
    { name: "Wed", time: 80, focus: 90 },
    { name: "Thu", time: 30, focus: 50 },
    { name: "Fri", time: 90, focus: 70 },
    { name: "Sat", time: 120, focus: 95 },
    { name: "Sun", time: 70, focus: 85 },
  ];

  return {
    user,
    displayName,
    info,
    attendanceDates,
    calendar,
    setCalendar,
    daysArray,
    year,
    month,
    stats,
    productivityData,
    weekDays,
  };
}
