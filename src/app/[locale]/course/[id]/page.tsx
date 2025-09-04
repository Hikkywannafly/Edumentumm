import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import CourseDetailPage from "../../../../components/course/detail/course-detail";

export default function Course() {
  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader title="Course" showThemeToggle={true} />

      {/* Main content */}
      <CourseDetailPage />
    </DashboardLayout>
  );
}
