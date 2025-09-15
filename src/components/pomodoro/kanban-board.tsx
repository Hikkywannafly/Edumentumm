"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task } from "@/contexts/pomodoro-context";
import { GripVertical, Plus, Trello } from "lucide-react";

interface KanbanBoardViewProps {
  tasks: Task[];
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: () => void;
}

export function KanbanBoardView({
  tasks,
  newTask,
  setNewTask,
  addTask,
}: KanbanBoardViewProps) {
  const todoTasks = tasks.filter((task) => task.status === "PENDING");

  return (
    <div className="space-y-4">
      {/* Kanban Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trello className="h-5 w-5" />
              <span className="font-semibold">Kanban Board</span>
            </div>
            <Select defaultValue="todo">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do ({todoTasks.length})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Column */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">To Do ({todoTasks.length})</h3>
            <Button variant="ghost" size="sm" onClick={addTask}>
              <Plus className="mr-1 h-4 w-4" />
              Add task
            </Button>
          </div>

          {/* Add Task Input */}
          <div className="mb-4">
            <Input
              placeholder="Add a task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
          </div>

          {/* Task Cards */}
          <div className="space-y-3">
            {todoTasks.map((task) => (
              <Card
                key={task.id}
                className="shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <GripVertical className="h-4 w-4mt-0.5 cursor-grab" />
                    <div className="flex-1">
                      <div className="font-medium">{task.nameTask}</div>
                      <div className="mt-1 text-sm">Ok</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
