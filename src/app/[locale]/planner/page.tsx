"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import PlannerContent from "../../../components/planner/planner-content";

export default function PlannerPage() {
  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeaderClient title="Pomodoro" showThemeToggle={true} />

      {/* Main content */}
      <PlannerContent />
    </DashboardLayout>
  );
}
