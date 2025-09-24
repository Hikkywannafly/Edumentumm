"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useKanbanTasks } from "@/hooks/kanban/use-kanban-query";
import type { ITask } from "@/types/task";
import { Calendar, Trello } from "lucide-react";
import { useState } from "react";

// Task Card Component for Kanban Tasks
const KanbanTaskCard = ({ task }: { task: ITask }) => (
  <Card className="shadow-sm transition-shadow hover:shadow-md">
    <CardContent className="p-3">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="font-medium">{task.title}</div>
          <div className="line-clamp-2 text-muted-foreground text-sm">
            {task.description}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {new Date(task.dueDate).toLocaleDateString()}
            </Badge>
            <Badge
              variant="secondary"
              className={
                task.status === "TODO"
                  ? "bg-blue-100 text-blue-800"
                  : task.status === "IN_PROGRESS"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
              }
            >
              {task.status === "TODO"
                ? "To Do"
                : task.status === "IN_PROGRESS"
                  ? "In Progress"
                  : "Done"}
            </Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Loading Skeleton
const TasksSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-16 w-full" />
  </div>
);

export function KanbanBoardView() {
  const [selectedStatus, setSelectedStatus] = useState<
    "TODO" | "IN_PROGRESS" | "DONE"
  >("TODO");

  // Use React Query to fetch kanban tasks from API
  const { data: kanbanTasks = [], isLoading: kanbanLoading } = useKanbanTasks();

  // Ensure kanban tasks is always an array
  const kanbanTasksArray = Array.isArray(kanbanTasks) ? kanbanTasks : [];

  // Calculate stats for kanban tasks
  const kanbanStats = {
    total: kanbanTasksArray.length,
    todo: kanbanTasksArray.filter((task) => task.status === "TODO").length,
    inProgress: kanbanTasksArray.filter((task) => task.status === "IN_PROGRESS")
      .length,
    done: kanbanTasksArray.filter((task) => task.status === "DONE").length,
  };

  // Filter kanban tasks by selected status
  const filteredKanbanTasks = kanbanTasksArray.filter(
    (task) => task.status === selectedStatus,
  );

  // Get status display info for kanban tasks
  const getStatusInfo = (status: ITask["status"]) => {
    switch (status) {
      case "TODO":
        return { label: "To Do", count: kanbanStats.todo };
      case "IN_PROGRESS":
        return { label: "In Progress", count: kanbanStats.inProgress };
      case "DONE":
        return { label: "Done", count: kanbanStats.done };
      default:
        return { label: "Unknown", count: 0 };
    }
  };

  const currentStatusInfo = getStatusInfo(selectedStatus);

  // Check if user has no kanban tasks
  const hasNoKanbanTasks = !kanbanLoading && kanbanTasksArray.length === 0;

  return (
    <div className="space-y-4">
      {/* Kanban Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trello className="h-5 w-5" />
              <span className="font-semibold">Kanban Board</span>
              {!kanbanLoading && kanbanStats.total > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {kanbanStats.total} tasks
                </Badge>
              )}
            </div>
            <Select
              value={selectedStatus}
              onValueChange={(value: "TODO" | "IN_PROGRESS" | "DONE") =>
                setSelectedStatus(value)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    To Do ({kanbanStats.todo})
                  </div>
                </SelectItem>
                <SelectItem value="IN_PROGRESS">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    In Progress ({kanbanStats.inProgress})
                  </div>
                </SelectItem>
                <SelectItem value="DONE">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Done ({kanbanStats.done})
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Tasks Display */}
      {hasNoKanbanTasks ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-lg">No kanban tasks found</h3>
                <p className="text-muted-foreground text-sm">
                  Create kanban tasks to organize your workflow alongside
                  pomodoro sessions!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">
                {currentStatusInfo.label} ({currentStatusInfo.count})
              </h3>
              <Badge variant="outline">
                {currentStatusInfo.label}: {currentStatusInfo.count}
              </Badge>
            </div>

            {/* Kanban Task Cards */}
            <div className="space-y-3">
              {kanbanLoading ? (
                <TasksSkeleton />
              ) : filteredKanbanTasks.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    No tasks in {currentStatusInfo.label.toLowerCase()}
                  </p>
                </div>
              ) : (
                <div className="max-h-64 space-y-3 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {filteredKanbanTasks.map((task) => (
                    <KanbanTaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
