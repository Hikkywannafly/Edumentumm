"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePomodoro } from "@/contexts/pomodoro-context";
import { RotateCcw } from "lucide-react";

export default function LandingPomodoro() {
  const {
    timerType,
    timerMode,
    countdownMinutes,
    time,
    isRunning,
    progress,
    setTimerType,
    setCountdownMinutes,
    handleStart,
    handleReset,
    handleModeChange,
    formatTime,
  } = usePomodoro();

  return (
    <Card className="h-fit p-6">
      <CardContent className="space-y-6">
        {/* Timer Type */}
        <div className="flex justify-center gap-2">
          <Button
            variant={timerType === "pomodoro" ? "default" : "outline"}
            onClick={() => setTimerType("pomodoro")}
            className="rounded-full px-6 py-2 font-medium"
          >
            Pomodoro
          </Button>
          <Button
            variant={timerType === "countdown" ? "default" : "outline"}
            onClick={() => setTimerType("countdown")}
            className="rounded-full px-6 py-2 font-medium"
          >
            Countdown
          </Button>
        </div>

        {/* Countdown input */}
        {timerType === "countdown" && (
          <div className="my-2 flex items-center justify-center gap-2">
            <label htmlFor="landing-countdown" className="font-medium">
              Minutes:
            </label>
            <input
              id="landing-countdown"
              type="number"
              min={1}
              value={countdownMinutes}
              onChange={(e) =>
                setCountdownMinutes(Math.max(1, Number(e.target.value)))
              }
              className="w-20 rounded border px-3 py-1 text-center"
            />
          </div>
        )}

        {/* Pomodoro modes */}
        {timerType === "pomodoro" && (
          <div className="flex justify-center gap-2">
            <Button
              variant={timerMode === "focus" ? "default" : "outline"}
              onClick={() => handleModeChange("focus")}
            >
              Focus
            </Button>
            <Button
              variant={timerMode === "shortBreak" ? "default" : "outline"}
              onClick={() => handleModeChange("shortBreak")}
            >
              Short break
            </Button>
            <Button
              variant={timerMode === "longBreak" ? "default" : "outline"}
              onClick={() => handleModeChange("longBreak")}
            >
              Long break
            </Button>
          </div>
        )}

        {/* Timer Display */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative h-72 w-72">
            <svg
              className="-rotate-90 h-full w-full transform"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="text-blue-600 transition-all duration-1000 ease-linear"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-bold text-5xl">{formatTime(time)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              size="lg"
              onClick={handleStart}
              className="px-8 py-3 font-semibold text-lg"
            >
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
