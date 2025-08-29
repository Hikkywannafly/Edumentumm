"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Award,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/auth-context";
import { profileAPI } from "../../../lib/api/profile";
import { LevelBadge } from "../level-badge";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const getDaysInMonth = (y: number, m: number) =>
  new Date(y, m + 1, 0).getDate();
const getFirstDayOfWeek = (y: number, m: number) => {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
};

export default function UserProfile() {
  const { user } = useAuth();
  const displayName = user?.username || user?.email || "User";
  const [userData, setUserData] = useState<any>(null);
  const [attendanceDates, setAttendanceDates] = useState<string[]>([]);
  const today = new Date();
  const [calendar, setCalendar] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const { year, month } = calendar;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);
  const daysArray = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  useEffect(() => {
    profileAPI.getProfile().then((res) =>
      setUserData({
        level: res.data.levelProgress?.replace("LEVEL_", "") || "1",
        xp: res.data.totalStudyTimeToday ?? 0,
        streak: res.data.streak ?? 0,
        createdAt: res.data.createdAt,
        totalStudyTimeToday: res.data.totalStudyTimeToday ?? 0,
        profileViews: 1,
        quizzesCreated: res.data.totalQuizzesCreated ?? 0,
        quizzesCompleted: res.data.totalQuizzesCompleted ?? 0,
        flashcardsCreated: res.data.totalFlashCardCreated ?? 0,
        flashcardsCompleted: res.data.totalFlashCardCompleted ?? 0,
        totalAttendance: res.data.totalAttendance ?? 0,
      }),
    );
    profileAPI
      .getAttendance()
      .then((res) =>
        setAttendanceDates(
          Array.isArray(res.data) ? res.data.map((i: any) => i.localDate) : [],
        ),
      );
  }, []);

  const stats = [
    {
      title: "Study Streak",
      value: userData?.streak ?? 0,
      subtitle: "Longest: 0 days",
      icon: Trophy,
      color: "text-orange-500",
    },
    {
      title: "Total Focus Time",
      value: `${Math.floor((userData?.xp ?? 0) / 60)}h ${
        (userData?.xp ?? 0) % 60
      }m`,
      subtitle: "Time spent studying",
      icon: Clock,
      color: "text-blue-500",
    },
    {
      title: "Level Progress",
      value: `Level ${userData?.level ?? 1}`,
      subtitle: `${userData?.xp ?? 0}/100 XP`,
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      title: "Attendance",
      value: userData?.totalAttendance ?? 0,
      subtitle: "Total attendance days",
      icon: Award,
      color: "text-green-500",
    },
    {
      title: "Quizzes Created",
      value: userData?.quizzesCreated ?? 0,
      subtitle: "Total quizzes created",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Quizzes Completed",
      value: userData?.quizzesCompleted ?? 0,
      subtitle: "Total quizzes completed",
      icon: BookOpen,
      color: "text-pink-500",
    },
    {
      title: "Flashcards Created",
      value: userData?.flashcardsCreated ?? 0,
      subtitle: "Total flashcards created",
      icon: BarChart3,
      color: "text-emerald-500",
    },
    {
      title: "Flashcards Mastered",
      value: userData?.flashcardsCompleted ?? 0,
      subtitle: "Total flashcards mastered",
      icon: BarChart3,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
        <img
          src={
            user?.bannerUrl ||
            "https://t3.ftcdn.net/jpg/04/12/12/98/360_F_412129819_HaLS1MLvkJBPaBPMagPUOYm1SfAcaT7h.jpg"
          }
          alt="Profile banner"
          className="h-full w-full object-cover"
        />
      </div>
      {/* Profile Info */}
      <div className="-mt-16 container relative z-10 mx-auto px-4">
        <div className="mb-8 flex flex-col items-start text-start">
          <div className="relative mb-6">
            <Avatar className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-background">
              <AvatarImage
                src={user?.imageUrl || "/placeholder.svg"}
                className="h-full w-full object-cover"
              />
              <AvatarFallback className="flex h-full w-full items-center justify-center bg-muted font-bold text-4xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            {/* Tên user */}
            <h1 className="mb-3 font-bold text-4xl">{displayName}</h1>

            {/* Badge + XP + Streak */}
            <div className="mb-3 flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <LevelBadge level={userData?.level} />
              </div>
              <span className="font-medium text-base">{userData?.xp} XP</span>
              <span className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>{userData?.streak} days streak</span>
              </span>
            </div>

            {/* Created date + views */}
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm">
              <span>
                Created at{" "}
                {userData?.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString()
                  : ""}
              </span>
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {userData?.profileViews} views
              </span>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{stat.value}</div>
                <p className="text-muted-foreground text-xs">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Calendar & Productivity */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <button
                type="button"
                className="rounded-full p-2 hover:bg-muted"
                onClick={() =>
                  setCalendar((prev) =>
                    prev.month === 0
                      ? { year: prev.year - 1, month: 11 }
                      : { ...prev, month: prev.month - 1 },
                  )
                }
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <CardTitle>
                {new Date(year, month).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-muted"
                onClick={() =>
                  setCalendar((prev) =>
                    prev.month === 11
                      ? { year: prev.year + 1, month: 0 }
                      : { ...prev, month: prev.month + 1 },
                  )
                }
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-2 font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
                {daysArray.map((day, idx) => {
                  if (day === null) return <div key={`empty-${idx}`} />;
                  const dateStr = `${year}-${String(month + 1).padStart(
                    2,
                    "0",
                  )}-${String(day).padStart(2, "0")}`;
                  const isAttended = attendanceDates.includes(dateStr);
                  return (
                    <div
                      key={day}
                      className={`cursor-pointer rounded-md p-2 hover:bg-muted ${
                        isAttended ? "bg-blue-800 font-bold text-white" : ""
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Productivity Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-bold text-2xl">0h 0m</div>
                  <div className="text-muted-foreground text-xs">
                    Avg daily time
                  </div>
                </div>
                <div>
                  <div className="font-bold text-2xl">0%</div>
                  <div className="text-muted-foreground text-xs">
                    Focus quality
                  </div>
                </div>
                <div>
                  <div className="font-bold text-2xl">0</div>
                  <div className="text-muted-foreground text-xs">
                    Quizzes done
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
