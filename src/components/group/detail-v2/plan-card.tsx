"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  MessageSquare,
  Star,
  Users,
} from "lucide-react";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  dueDate: string;
}

interface Plan {
  id: number;
  title: string;
  description: string;
  creator: string;
  participants: number;
  duration: string;
  status: string;
  progress: number;
  subject: string;
  startDate: string;
  endDate: string;
  tasks: Task[];
  notes: string;
  rating: number;
}

interface PlanCardProps {
  plan: Plan;
  isExpanded: boolean;
  onToggleExpansion: () => void;
}

export function PlanCard({
  plan,
  isExpanded,
  onToggleExpansion,
}: PlanCardProps) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="font-semibold text-lg">{plan.title}</h3>
              <Badge variant="outline">{plan.subject}</Badge>
              {plan.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-sm">{plan.rating}</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-muted-foreground text-sm">
              {plan.description}
            </p>
          </div>
          <Badge
            variant={
              plan.status === "active"
                ? "default"
                : plan.status === "completed"
                  ? "secondary"
                  : "outline"
            }
          >
            {plan.status === "active"
              ? "Đang diễn ra"
              : plan.status === "completed"
                ? "Hoàn thành"
                : "Sắp diễn ra"}
          </Badge>
        </div>

        <div className="mb-3 flex items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{plan.participants} thành viên</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {plan.startDate} - {plan.endDate}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs">
                {plan.creator
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span>{plan.creator}</span>
          </div>
        </div>

        {plan.status === "active" && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Tiến độ</span>
              <span>{plan.progress}%</span>
            </div>
            <Progress value={plan.progress} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {plan.status === "active" && (
              <Button size="sm" variant="outline">
                <CheckCircle className="mr-1 h-4 w-4" />
                Tham gia
              </Button>
            )}
            <Button size="sm" variant="ghost">
              <Edit className="mr-1 h-4 w-4" />
              Chỉnh sửa
            </Button>
          </div>
          <Button size="sm" variant="ghost" onClick={onToggleExpansion}>
            {isExpanded ? (
              <>
                <ChevronUp className="mr-1 h-4 w-4" />
                Thu gọn
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-4 w-4" />
                Chi tiết
              </>
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            {/* Tasks List */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 font-medium">
                <CheckCircle className="h-4 w-4" />
                Danh sách nhiệm vụ (
                {plan.tasks.filter((t) => t.completed).length}/
                {plan.tasks.length})
              </h4>
              <div className="space-y-2">
                {plan.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded border p-2"
                  >
                    <Checkbox checked={task.completed} disabled />
                    <div className="flex-1">
                      <p
                        className={`text-sm ${
                          task.completed
                            ? "text-muted-foreground line-through"
                            : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Hạn: {task.dueDate}
                      </p>
                    </div>
                    {task.completed && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 font-medium">
                <MessageSquare className="h-4 w-4" />
                Ghi chú
              </h4>
              <p className="rounded bg-muted p-3 text-muted-foreground text-sm">
                {plan.notes}
              </p>
            </div>

            {/* Progress Details */}
            {plan.status === "active" && (
              <div>
                <h4 className="mb-2 font-medium">Chi tiết tiến độ</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded bg-muted p-2">
                    <p className="font-semibold text-green-600 text-lg">
                      {plan.tasks.filter((t) => t.completed).length}
                    </p>
                    <p className="text-muted-foreground text-xs">Hoàn thành</p>
                  </div>
                  <div className="rounded bg-muted p-2">
                    <p className="font-semibold text-lg text-orange-600">
                      {plan.tasks.filter((t) => !t.completed).length}
                    </p>
                    <p className="text-muted-foreground text-xs">Còn lại</p>
                  </div>
                  <div className="rounded bg-muted p-2">
                    <p className="font-semibold text-blue-600 text-lg">
                      {plan.participants}
                    </p>
                    <p className="text-muted-foreground text-xs">Thành viên</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
