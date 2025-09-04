import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import CourseContent from "../../../components/course/course-content";

export default function Course() {
  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader title="Course" showThemeToggle={true} />

      {/* Main content */}
      <CourseContent />
    </DashboardLayout>
  );
}
