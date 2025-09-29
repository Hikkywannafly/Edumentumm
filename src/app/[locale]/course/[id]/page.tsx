import { CourseDetail } from "@/components/course/detail/course-detail";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";

export default async function Course({
  params,
}: { params: Promise<{ courseId: number }> }) {
  const courseId = Number((await params).courseId);

  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader title="Course" showThemeToggle={true} />

      {/* Main content */}
      <CourseDetail courseId={courseId} />
    </DashboardLayout>
  );
}
