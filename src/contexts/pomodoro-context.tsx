"use client";

import {
  useCreateTodo,
  useDeleteTodo,
  useTodos,
  useToggleTodoCompletion,
  useUpdateTodo,
} from "@/hooks/todo/use-todos-query";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export type TimerMode = "focus" | "shortBreak" | "longBreak";
export type TimerType = "pomodoro" | "countdown";
export type ViewMode = "todo" | "kanban";

// Simplified Task interface that matches Todo
export interface Task {
  id: string;
  nameTask: string;
  status: "COMPLETED" | "PENDING";
  createdAt?: string;
}

interface PomodoroContextType {
  // Timer state
  timerType: TimerType;
  timerMode: TimerMode;
  countdownMinutes: number;
  time: number;
  isRunning: boolean;
  isMini: boolean;

  // Tasks state
  tasks: Task[];
  newTask: string;
  selectedCategory: string;
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;

  // Timer actions
  setTimerType: (type: TimerType) => void;
  setTimerMode: (mode: TimerMode) => void;
  setCountdownMinutes: (minutes: number) => void;
  handleStart: () => void;
  handleReset: () => void;
  handleModeChange: (mode: TimerMode) => void;

  // Tasks actions
  setNewTask: (task: string) => void;
  setSelectedCategory: (category: string) => void;
  setViewMode: (mode: ViewMode) => void;
  addTask: () => void;
  toggleTaskCompletion: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, nameTask: string) => void;

  // Mini player actions
  setIsMini: (mini: boolean) => void;
  toggleMini: () => void;

  // Utility
  formatTime: (seconds: number) => string;
  progress: number;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(
  undefined,
);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [timerType, setTimerTypeState] = useState<TimerType>("pomodoro");
  const [timerMode, setTimerModeState] = useState<TimerMode>("focus");
  const [countdownMinutes, setCountdownMinutesState] = useState(1);
  const [time, setTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMini, setIsMiniState] = useState(false);

  const [newTask, setNewTaskState] = useState("");
  const [selectedCategory, setSelectedCategoryState] =
    useState("Uncategorized");
  const [viewMode, setViewModeState] = useState<ViewMode>("todo");

  // API hooks for todos
  const { data: todosData, isLoading, error: todosError } = useTodos();
  const createTodoMutation = useCreateTodo();
  const deleteTodoMutation = useDeleteTodo();
  const toggleCompletionMutation = useToggleTodoCompletion();
  const updateTodoMutation = useUpdateTodo();

  // Convert API todos to Tasks - now they're already in the right format
  const tasks: Task[] = todosData || [];

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const timerModes = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  // Timer type change handler
  const setTimerType = (type: TimerType) => {
    setTimerTypeState(type);
    setIsRunning(false);
    if (type === "pomodoro") {
      setTimerModeState("focus");
      setTime(timerModes.focus);
    } else if (type === "countdown") {
      setTime(countdownMinutes * 60);
    }
  };

  // Countdown minutes change handler
  const setCountdownMinutes = (val: number) => {
    setCountdownMinutesState(val);
    if (timerType === "countdown") {
      setTime(val * 60);
      setIsRunning(false);
    }
  };

  // Timer mode change handler
  const setTimerMode = (mode: TimerMode) => {
    setTimerModeState(mode);
    setTime(timerModes[mode]);
    setIsRunning(false);
  };

  // Start/Stop timer
  const handleStart = () => {
    setIsRunning(!isRunning);
  };

  // Reset timer
  const handleReset = () => {
    setIsRunning(false);
    if (timerType === "pomodoro") {
      setTime(timerModes[timerMode]);
    } else if (timerType === "countdown") {
      setTime(countdownMinutes * 60);
    }
  };

  // Mode change handler
  const handleModeChange = (mode: TimerMode) => {
    setTimerMode(mode);
    setTime(timerModes[mode]);
    setIsRunning(false);
  };

  // Add task
  const addTask = () => {
    if (newTask.trim()) {
      createTodoMutation.mutate({
        nameTask: newTask.trim(),
        status: "PENDING",
      });
      setNewTaskState("");
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      toggleCompletionMutation.mutate({
        todoId: taskId,
        completed: task.status === "PENDING", // Toggle: if PENDING, make it COMPLETED
        nameTask: task.nameTask, // Include nameTask as required by backend
      });
    }
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    deleteTodoMutation.mutate(taskId);
  };

  // Update task
  const updateTask = (taskId: string, nameTask: string) => {
    updateTodoMutation.mutate({
      todoId: taskId,
      todoData: {
        nameTask: nameTask,
      },
    });
  };

  // Mini player actions
  const setIsMini = (mini: boolean) => {
    setIsMiniState(mini);
  };

  const toggleMini = () => {
    setIsMiniState(!isMini);
  };

  // Format time utility
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress
  let progress = 0;
  if (timerType === "pomodoro") {
    progress = ((timerModes[timerMode] - time) / timerModes[timerMode]) * 100;
  } else if (timerType === "countdown") {
    progress = ((countdownMinutes * 60 - time) / (countdownMinutes * 60)) * 100;
  }

  // Timer effect
  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, time]);

  const value: PomodoroContextType = {
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
    error: todosError?.message || null,
    setTimerType,
    setTimerMode,
    setCountdownMinutes,
    handleStart,
    handleReset,
    handleModeChange,
    setNewTask: setNewTaskState,
    setSelectedCategory: setSelectedCategoryState,
    setViewMode: setViewModeState,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    updateTask,
    setIsMini,
    toggleMini,
    formatTime,
    progress,
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }
  return context;
}
