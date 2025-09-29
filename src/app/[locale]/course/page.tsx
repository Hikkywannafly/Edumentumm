import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import CoursePage from "../../../components/course/course-page";

export default function Course() {
  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeaderClient title="Course" showThemeToggle={true} />

      {/* Main content */}
      <CoursePage />
    </DashboardLayout>
  );
}
