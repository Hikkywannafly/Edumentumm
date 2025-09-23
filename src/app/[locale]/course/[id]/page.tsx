import { CourseDetail } from "@/components/course/detail/course-detail";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";

export default function Course() {
  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader title="Course" showThemeToggle={true} />

      {/* Main content */}
      <CourseDetail />
    </DashboardLayout>
  );
}
