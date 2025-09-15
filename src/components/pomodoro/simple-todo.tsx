"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Task } from "@/contexts/pomodoro-context";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface SimpleTodoViewProps {
  tasks: Task[];
  newTask: string;
  selectedCategory: string;
  isLoading: boolean;
  error: string | null;
  setNewTask: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  addTask: () => void;
  toggleTaskCompletion: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, nameTask: string) => void;
}

export function SimpleTodoView({
  tasks,
  newTask,
  isLoading,
  error,
  setNewTask,
  addTask,
  toggleTaskCompletion,
  deleteTask,
  updateTask,
}: SimpleTodoViewProps) {
  const t = useTranslations("Pomodoro");

  // State for edit dialog
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editedNameTask, setEditedNameTask] = useState("");

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditedNameTask(task.nameTask);
  };

  const handleSaveEdit = () => {
    if (editingTask && editedNameTask.trim()) {
      updateTask(editingTask.id, editedNameTask.trim());
      setEditingTask(null);
      setEditedNameTask("");
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditedNameTask("");
  };

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="text-red-500 text-sm">
              Error loading todos: {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Task */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder={t("simpleTodo.placeholder")}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={addTask} size="icon" disabled={isLoading}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">Loading todos...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-2 font-semibold text-xl">{t("notTask")}</p>
              <p>{t("advice")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-3 rounded-lg border p-3"
                >
                  <input
                    type="checkbox"
                    checked={task.status === "COMPLETED"}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="h-4 w-4"
                    disabled={isLoading}
                  />
                  <span
                    className={`flex-1 ${task.status === "COMPLETED" ? "line-through" : ""}`}
                  >
                    {task.nameTask}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(task)}
                    className="h-8 w-8 text-gray-400 opacity-0 transition-opacity hover:text-blue-500 group-hover:opacity-100"
                    disabled={isLoading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    className="h-8 w-8 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog
        open={!!editingTask}
        onOpenChange={(open) => !open && handleCancelEdit()}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nameTask" className="text-right">
                Task Name
              </Label>
              <Input
                id="nameTask"
                value={editedNameTask}
                onChange={(e) => setEditedNameTask(e.target.value)}
                className="col-span-3"
                placeholder="Enter task name..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveEdit();
                  } else if (e.key === "Escape") {
                    handleCancelEdit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editedNameTask.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
