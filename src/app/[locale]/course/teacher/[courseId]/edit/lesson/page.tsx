import { CourseContentManager } from "@/components/course/teacher/course-content-manager";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";

export default async function CourseContentPage({
  params,
}: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader title="Manage Course Content" showThemeToggle={true} />

      {/* Main content */}
      <CourseContentManager courseId={courseId} />
    </DashboardLayout>
  );
}
