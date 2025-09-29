"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { BarChart3, Calendar, Eye, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LocalizedLink } from "../localized-link";

// Task Card Component
const TaskCard = ({ task }: { task: ITask }) => (
  <Card className="mb-2">
    <CardContent className="p-3">
      <h4 className="font-medium text-sm">{task.title}</h4>
      <p className="line-clamp-2 text-muted-foreground text-xs">
        {task.description}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {new Date(task.dueDate).toLocaleDateString()}
        </Badge>
      </div>
    </CardContent>
  </Card>
);

// Loading Skeleton
const TasksSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
);

export default function KanbanBoard() {
  const t = useTranslations("Dashboard");
  const tKanban = useTranslations("Kanban");

  const [selectedStatus, setSelectedStatus] = useState<
    "TODO" | "IN_PROGRESS" | "DONE"
  >("TODO");

  // Use React Query hooks
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError,
  } = useKanbanTasks();

  const tasksArray = Array.isArray(tasks) ? tasks : [];

  // Calculate stats from tasks data
  const stats = {
    total: tasksArray.length,
    todo: tasksArray.filter((task) => task.status === "TODO").length,
    inProgress: tasksArray.filter((task) => task.status === "IN_PROGRESS")
      .length,
    done: tasksArray.filter((task) => task.status === "DONE").length,
  };

  // Filter tasks by selected status
  const filteredTasks = tasksArray.filter(
    (task) => task.status === selectedStatus,
  );

  // Get status display info
  const getStatusInfo = (status: ITask["status"]) => {
    switch (status) {
      case "TODO":
        return {
          label: t("toDo"),
          color: "bg-blue-100 text-blue-800",
          count: stats.todo,
        };
      case "IN_PROGRESS":
        return {
          label: t("inProgress"),
          color: "bg-yellow-100 text-yellow-800",
          count: stats.inProgress,
        };
      case "DONE":
        return {
          label: t("done"),
          color: "bg-green-100 text-green-800",
          count: stats.done,
        };
      default:
        return {
          label: tKanban("status.todo"),
          color: "bg-gray-100 text-gray-800",
          count: 0,
        };
    }
  };

  const currentStatusInfo = getStatusInfo(selectedStatus);

  // Check if user has no tasks at all
  const hasNoTasks = !tasksLoading && tasksArray.length === 0;

  // Show error state
  if (tasksError) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("kanbanBoard")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-destructive text-sm">
              {t("failedToLoadKanban")}
            </p>
            <Button variant="outline" className="w-full" asChild>
              <LocalizedLink href="/kanban">
                <Eye className="mr-2 h-4 w-4" />
                {t("viewFullBoard")}
              </LocalizedLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t("kanbanBoard")}
        </CardTitle>

        {/* Stats Summary */}
        {!tasksLoading && stats.total > 0 && (
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">
              {t("totalTasks", { total: stats.total })}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Show "No active kanban boards" message when user has no tasks at all */}
        {hasNoTasks ? (
          <div className="space-y-4 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-lg">
                {t("noActiveKanbanBoards")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("createKanbanDescription")}
              </p>
            </div>
            <Button variant="default" className="mt-4" asChild>
              <LocalizedLink href="/kanban">
                <Plus className="mr-2 h-4 w-4" />
                {t("createYourFirstBoard")}
              </LocalizedLink>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Filter */}
            <div className="flex items-center justify-between">
              {/* Label + Select */}
              <div className="flex items-center gap-3">
                <span className="font-medium text-muted-foreground text-sm">
                  {t("status")}
                </span>
                <Select
                  value={selectedStatus}
                  onValueChange={(value: "TODO" | "IN_PROGRESS" | "DONE") =>
                    setSelectedStatus(value)
                  }
                >
                  <SelectTrigger className="h-9 w-44 rounded-md border border-input bg-background px-3 font-medium text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1">
                    <SelectValue placeholder={t("selectStatus")} />
                  </SelectTrigger>

                  <SelectContent className="rounded-md shadow-lg">
                    <SelectItem value="TODO" className="cursor-pointer">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        <span>{t("toDo")}</span>
                        {!tasksLoading && (
                          <Badge
                            variant="secondary"
                            className="ml-1 px-1.5 text-xs"
                          >
                            {stats.todo}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>

                    <SelectItem value="IN_PROGRESS" className="cursor-pointer">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                        <span>{t("inProgress")}</span>
                        {!tasksLoading && (
                          <Badge
                            variant="secondary"
                            className="ml-1 px-1.5 text-xs"
                          >
                            {stats.inProgress}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>

                    <SelectItem value="DONE" className="cursor-pointer">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        <span>{t("done")}</span>
                        {!tasksLoading && (
                          <Badge
                            variant="secondary"
                            className="ml-1 px-1.5 text-xs"
                          >
                            {stats.done}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Status Badge */}
              <Badge
                className={`${currentStatusInfo.color} px-2.5 py-0.5 font-medium text-sm`}
              >
                {currentStatusInfo.label}: {currentStatusInfo.count}
              </Badge>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
              {tasksLoading ? (
                <TasksSkeleton />
              ) : filteredTasks.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t("noTasksInStatus", {
                      status: currentStatusInfo.label.toLowerCase(),
                    })}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t("createNewTask")}
                  </p>
                </div>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {filteredTasks.slice(0, 5).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {filteredTasks.length > 5 && (
                    <div className="pt-2 text-center">
                      <Button variant="ghost" size="sm" asChild>
                        <LocalizedLink href="/kanban">
                          {t("viewMoreTasks", {
                            count: filteredTasks.length - 5,
                          })}
                        </LocalizedLink>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <LocalizedLink href="/kanban">
                  <Eye className="mr-2 h-4 w-4" />
                  {t("viewFullBoard")}
                </LocalizedLink>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
