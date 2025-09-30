"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlignVerticalJustifyEnd,
  ChevronLeft,
  ChevronRight,
  ShieldQuestion,
  Trophy,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {} from "recharts";
import { useAuth } from "../../../contexts/auth-context";
import { useProfileDailyQuiz } from "../../../hooks/profile/use-daily-quiz";
import { useProfile } from "../../../hooks/profile/use-profile";
import { useProfileAttendance } from "../../../hooks/profile/use-profile-attendance";
import { useProfileStart } from "../../../hooks/profile/use-profile-start";
import { useProfileStudyTime } from "../../../hooks/profile/use-profile-study-time";
import { AchievementCard } from "./achievement-card";

export default function UserProfile() {
  const {
    setCalendar,
    daysArray,
    year,
    month,
    productivityData,
    weekDays,
    dayOfTheWeek,
    hourBlocks2h,
  } = useProfile();

  const { stats, info } = useProfileStart();
  const { studyTime } = useProfileStudyTime();
  const { user } = useAuth();
  const { info: dailyQuizInfo } = useProfileDailyQuiz();
  const { attendanceDates } = useProfileAttendance();

  function getHeatColor(minutes: number) {
    if (minutes < 5) return "#cfd7e6";
    if (minutes < 10) return "#dbeafe";
    if (minutes < 20) return "#93c5fd";
    if (minutes < 30) return "#60a5fa";
    if (minutes < 45) return "#3b82f6";
    if (minutes < 60) return "#2563eb";
    if (minutes < 90) return "#1d4ed8";
    return "#1e40af";
  }

  function getHeatTextColor(minutes: number) {
    if (minutes === 0) return "#64748b";
    if (minutes < 45) return "#1e293b";
    return "#ffffff";
  }

  const dataRadar = [
    {
      subject: "Math",
      A: 120,
      B: 110,
      fullMark: 150,
    },
    {
      subject: "Chinese",
      A: 98,
      B: 130,
      fullMark: 150,
    },
    {
      subject: "English",
      A: 86,
      B: 130,
      fullMark: 150,
    },
    {
      subject: "Geography",
      A: 99,
      B: 100,
      fullMark: 150,
    },
    {
      subject: "Physics",
      A: 85,
      B: 90,
      fullMark: 150,
    },
    {
      subject: "History",
      A: 65,
      B: 85,
      fullMark: 150,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
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
      <div className="-mt-16 container relative z-10 mx-auto px-4">
        <div className="mb-8 flex flex-col items-start text-start">
          <div className="relative mb-6">
            <Avatar className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-background">
              <AvatarImage
                src={user?.imageUrl || "/placeholder.svg"}
                className="h-full w-full object-cover"
              />
              <AvatarFallback className="flex h-full w-full items-center justify-center bg-muted font-bold text-4xl">
                {user?.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h1 className="mb-3 font-bold text-4xl">{user?.username}</h1>
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm">
              <span>
                Created at{" "}
                {info?.createdAt
                  ? new Date(info.createdAt).toLocaleDateString()
                  : ""}
              </span>
              {/* <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {info?.profileViews} views
              </span> */}
            </div>
          </div>
        </div>

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

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <button
                type="button"
                className="rounded-full p-2 hover:bg-sm"
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
              <CardTitle className=" text-sm">
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
                {dayOfTheWeek.map((day) => (
                  <div
                    key={day}
                    className=" font-medium text-muted-foreground text-sm"
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
                      className={`flex aspect-square h-10 w-24 items-center justify-center rounded-sm bg-zinc-100 dark:bg-zinc-800 ${
                        isAttended ? "" : ""
                      } relative font-medium text-sm`}
                    >
                      {day}
                      {isAttended && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                Study Time Over the past 7 days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: 180 }}>
                <ResponsiveContainer>
                  <LineChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 2px 8px #0001",
                        fontSize: 14,
                      }}
                      cursor={{
                        stroke: "#6366f1",
                        strokeWidth: 1,
                        fill: "#6366f122",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="time"
                      name="Study Time"
                      stroke="#6366f1"
                      strokeWidth={1}
                      dot={{
                        r: 5,
                        stroke: "#6366f1",
                        strokeWidth: 1,
                        fill: "#fff",
                      }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="focus"
                      name="Focus Quality"
                      stroke="#22c55e"
                      strokeWidth={1}
                      dot={{
                        r: 5,
                        stroke: "#22c55e",
                        strokeWidth: 2,
                        fill: "#fff",
                      }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="f"
                      name="Focus Quality"
                      stroke="#0b2414"
                      strokeWidth={1}
                      dot={{
                        r: 5,
                        stroke: "#22c55e",
                        strokeWidth: 2,
                        fill: "#fff",
                      }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-bold text-sm">0h 0m</div>
                  <div className="text-muted-foreground text-sm">
                    Total Study Time
                  </div>
                </div>
                <div>
                  <div className="font-bold text-sm">0%</div>
                  <div className="text-muted-foreground text-sm">
                    Total Study Time Today
                  </div>
                </div>
                <div>
                  <div className="font-bold text-sm">0</div>
                  <div className="text-muted-foreground text-sm">
                    Quizzes done
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-semibold text-sm">
                Heatmap thời gian học hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-10 px-2 py-1 font-semibold text-xs text-zinc-500 dark:text-zinc-400" />
                      {hourBlocks2h.map((block) => (
                        <th
                          key={block}
                          className="px-1 py-1 text-center font-semibold text-xs text-zinc-500 dark:text-zinc-400"
                          style={{ minWidth: 40 }}
                        >
                          {block}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(studyTime) && studyTime.length > 0 ? (
                      studyTime.map((row, dayIdx) => (
                        <tr key={dayIdx}>
                          <td className="w-10 px-2 py-1 text-right font-semibold text-xs text-zinc-500 dark:text-zinc-400">
                            {weekDays[dayIdx] || `Day ${dayIdx + 1}`}
                          </td>
                          {row.map((minutes: number, blockIdx: number) => (
                            <td
                              key={blockIdx}
                              className="h-7 border border-zinc-200 px-0.5 py-1 transition-colors dark:border-zinc-700"
                              style={{
                                minWidth: 40,
                                background: getHeatColor(minutes),
                                color: getHeatTextColor(minutes),
                              }}
                            >
                              <p className="text-center font-bold text-xs">
                                {minutes > 0 ? minutes : ""}
                              </p>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={hourBlocks2h.length + 1}
                          className="bg-white py-4 text-center text-xs text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500"
                        >
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xs">
                QuizStatsChart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={dailyQuizInfo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip contentStyle={{ fontSize: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar
                    yAxisId="left"
                    dataKey="attempts"
                    fill="#3b82f6"
                    name="Attempts"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Avg Score"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xs">
                Radar Chart Example
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={dataRadar}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fontSize: 10 }} />
                  <Radar
                    name="Mike"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-semibold text-sm">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <AchievementCard
                  icon={<Trophy className="h-6 w-6 text-yellow-500" />}
                  title="7-Day Streak"
                  subtitle="Keep it up!"
                  color="yellow"
                />
                <AchievementCard
                  icon={<ShieldQuestion className="h-6 w-6 text-blue-500" />}
                  title="10 Quizzes"
                  subtitle="Quiz Master"
                  color="blue"
                />
                <AchievementCard
                  icon={
                    <AlignVerticalJustifyEnd className="h-6 w-6 text-green-500" />
                  }
                  title="30 Days"
                  subtitle="Attendance"
                  color="green"
                />
                <AchievementCard
                  icon={<ShieldQuestion className="h-6 w-6 text-blue-500" />}
                  title="10 Quizzes"
                  subtitle="Quiz Master"
                  color="blue"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
