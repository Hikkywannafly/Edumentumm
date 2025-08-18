"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Award,
  BarChart3,
  BookOpen,
  Camera,
  Clock,
  Eye,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { useAuth } from "../../../contexts/auth-context";

export default function UserProfile() {
  const { user } = useAuth();

  const displayName = user?.username || user?.email || "User";

  // Mock user data
  const userData = {
    level: 1,
    xp: 0,
    maxXp: 100,
    streak: 0,
    joinDate: "July 2025",
    profileViews: 1,
    avatar: null,
    bannerImage:
      "https://t3.ftcdn.net/jpg/04/12/12/98/360_F_412129819_HaLS1MLvkJBPaBPMagPUOYm1SfAcaT7h.jpg",
  };

  const stats = [
    {
      title: "Study Streak",
      value: "0",
      subtitle: "Longest: 0 days",
      icon: Trophy,
      color: "text-orange-500",
    },
    {
      title: "Total Focus Time",
      value: "0h 0m",
      subtitle: "Time spent studying",
      icon: Clock,
      color: "text-blue-500",
    },
    {
      title: "Level Progress",
      value: "Level 1",
      subtitle: "0/100 XP",
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      title: "Session Quality",
      value: "0%",
      subtitle: "Average focus quality",
      icon: Target,
      color: "text-green-500",
    },
    {
      title: "Quizzes Completed",
      value: "0",
      subtitle: "0% avg score",
      icon: Award,
      color: "text-purple-500",
    },
    {
      title: "Flashcards Mastered",
      value: "0",
      subtitle: "From 0 sets",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Content Created",
      value: "0",
      subtitle: "Total learning materials",
      icon: BookOpen,
      color: "text-pink-500",
    },
    {
      title: "Productivity Score",
      value: "0%",
      subtitle: "Overall performance",
      icon: BarChart3,
      color: "text-emerald-500",
    },
  ];

  const productivityInsights = {
    avgDailyTime: "0h 0m",
    focusQuality: "0%",
    quizzesDone: 0,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Banner */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
        <img
          src={userData.bannerImage || "/placeholder.svg"}
          alt="Profile banner"
          className="h-full w-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <Button variant="secondary" size="sm">
            <Camera className="mr-2 h-4 w-4" />
            Change Banner
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="-mt-16 container relative z-10 mx-auto px-4">
        <div className="mb-8 flex flex-col items-start text-start">
          <Avatar className="mb-6 h-32 w-32 border-4 border-background">
            <AvatarImage src={userData.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-muted font-bold text-4xl">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="mb-4 font-bold text-4xl">{displayName}</h1>
            <div className="mb-2 flex items-center justify-center gap-4 text-muted-foreground">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Level {userData.level}
              </Badge>
              <span>{userData.xp} XP</span>
              <span className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                {userData.streak} days streak
              </span>
            </div>
            <div className="flex flex-row items-center text-muted-foreground text-sm">
              Joined {userData.joinDate}
              <Eye className="mr-1 ml-5 w-3" />
              {userData.profileViews} views
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
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

        {/* Calendar and Productivity Insights */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>August 2025</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-2 font-medium text-muted-foreground"
                    >
                      {day}
                    </div>
                  ),
                )}
                {Array.from({ length: 31 }, (_, i) => (
                  <div
                    key={i + 1}
                    className="cursor-pointer rounded-md p-2 hover:bg-muted"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Productivity Insights */}
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
                  <div className="font-bold text-2xl">
                    {productivityInsights.avgDailyTime}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Avg daily time
                  </div>
                </div>
                <div>
                  <div className="font-bold text-2xl">
                    {productivityInsights.focusQuality}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Focus quality
                  </div>
                </div>
                <div>
                  <div className="font-bold text-2xl">
                    {productivityInsights.quizzesDone}
                  </div>
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
