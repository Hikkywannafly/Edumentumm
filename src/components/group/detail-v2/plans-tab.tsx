import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Target } from "lucide-react";
import { CreatePlanForm } from "./create-plan-form";
import { PlanCard } from "./plan-card";

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

interface PlansTabProps {
  plans: Plan[];
  expandedPlan: number | null;
  onTogglePlanExpansion: (planId: number) => void;
}

export function PlansTab({
  plans,
  expandedPlan,
  onTogglePlanExpansion,
}: PlansTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <CreatePlanForm />

      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Danh sách Plans
            </CardTitle>
            <CardDescription>Các kế hoạch học tập trong nhóm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isExpanded={expandedPlan === plan.id}
                  onToggleExpansion={() => onTogglePlanExpansion(plan.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
