"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface StudyTimeProps {
  todayMinutes?: number;
  yesterdayMinutes?: number;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export default function StudyTime({
  todayMinutes = 0,
  yesterdayMinutes = 0,
}: StudyTimeProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">Study Time</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="font-bold text-2xl">
              Today: {formatTime(todayMinutes)}
            </div>
          </div>
          <div>
            <div className="text-lg text-muted-foreground">
              Yesterday: {formatTime(yesterdayMinutes)}
            </div>
          </div>
          <div className="text-muted-foreground text-sm">
            Ready to start studying?
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
