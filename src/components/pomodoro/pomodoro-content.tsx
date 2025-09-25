"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePomodoro } from "@/contexts/pomodoro-context";
import { LayoutGrid, List, Plus, RotateCcw, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { KanbanBoardView } from "./kanban-board";
import { SimpleTodoView } from "./simple-todo";

export default function PomodoroContent() {
  const {
    timerType,
    timerMode,
    countdownMinutes,
    time,
    isRunning,
    isMini,
    tasks,
    newTask,
    selectedCategory,
    viewMode,
    isLoading,
    error,
    progress,
    setTimerType,
    setCountdownMinutes,
    handleStart,
    handleReset,
    handleModeChange,
    setNewTask,
    setSelectedCategory,
    setViewMode,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    updateTask,
    setIsMini,
    formatTime,
  } = usePomodoro();

  const t = useTranslations("Pomodoro");

  // Auto-minimize when navigating away from pomodoro page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isRunning) {
        setIsMini(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        setIsMini(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, setIsMini]);

  // Don't render full content if in mini mode
  if (isMini) return null;

  return (
    <div className="flex h-auto flex-col items-center justify-center p-6">
      <div className="grid w-full max-w-7xl gap-8 lg:grid-cols-2">
        {/* Timer Section */}
        <Card className="p-6">
          <CardContent className="space-y-6">
            {/* Header with minimize button */}
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-xl">Pomodoro Timer</h2>
            </div>

            {/* Timer Type Tags */}
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
                {t("countdown.title")}
              </Button>
            </div>

            {/* Countdown input nếu là countdown */}
            {timerType === "countdown" && (
              <div className="my-4 flex items-center justify-center gap-2">
                <label htmlFor="countdown-minutes" className="font-medium">
                  {t("countdown.duration")}:
                </label>
                <input
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

            {/* Timer Mode Buttons */}
            {timerType === "pomodoro" && (
              <div className="flex justify-center gap-2">
                <Button
                  variant={timerMode === "focus" ? "default" : "outline"}
                  onClick={() => handleModeChange("focus")}
                >
                  {t("pomodoro.focus")}
                </Button>
                <Button
                  variant={timerMode === "shortBreak" ? "default" : "outline"}
                  onClick={() => handleModeChange("shortBreak")}
                >
                  {t("pomodoro.shortBreak")}
                </Button>
                <Button
                  variant={timerMode === "longBreak" ? "default" : "outline"}
                  onClick={() => handleModeChange("longBreak")}
                >
                  {t("pomodoro.longBreak")}
                </Button>
              </div>
            )}

            {/* Category Selection */}
            <div className="flex items-center gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Study">Study</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Timer Display */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative h-80 w-80">
                {/* Progress Circle */}
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

                {/* Timer Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-bold text-6xl">{formatTime(time)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  onClick={handleStart}
                  className="px-8 py-3 font-semibold text-lg"
                >
                  {isRunning ? (
                    <span className="flex items-center gap-2">
                      {t("pause")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {t("start")}
                    </span>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleReset}>
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <Card className="h-fit p-6">
          <CardContent className="space-y-6">
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "todo" ? "default" : "outline"}
                onClick={() => setViewMode("todo")}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                {t("simpleTodo.title")}
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                onClick={() => setViewMode("kanban")}
                className="flex items-center gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                {t("kanbanBoard.title")}
              </Button>
            </div>

            {/* Render based on view mode */}
            {viewMode === "todo" ? (
              <SimpleTodoView
                tasks={tasks}
                newTask={newTask}
                selectedCategory={selectedCategory}
                isLoading={isLoading}
                error={error}
                setNewTask={setNewTask}
                setSelectedCategory={setSelectedCategory}
                addTask={addTask}
                toggleTaskCompletion={toggleTaskCompletion}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            ) : (
              <KanbanBoardView />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
