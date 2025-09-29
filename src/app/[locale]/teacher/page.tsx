import { TeacherPage } from "@/components/course/teacher/teacher-page";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";

export default function TeacherCoursePage() {
  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader title="Teacher Dashboard" showThemeToggle={true} />

      {/* Main content */}
      <TeacherPage />
    </DashboardLayout>
  );
}
