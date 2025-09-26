import { CourseContentManager } from "@/components/course/teacher/course-content-manager";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";

export default function CourseContentPage({
  params,
}: { params: { courseId: string } }) {
  const { courseId } = params;

  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader title="Manage Course Content" showThemeToggle={true} />

      {/* Main content */}
      <CourseContentManager courseId={courseId} />
    </DashboardLayout>
  );
}
