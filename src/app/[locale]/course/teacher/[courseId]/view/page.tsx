import { TeacherCourseView } from "@/components/course/teacher/teacher-course-view";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";

export default async function ViewCoursePage({
  params,
}: { params: Promise<{ courseId: number }> }) {
  const { courseId } = await params;

  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader title="Course Details" showThemeToggle={true} />

      {/* Main content */}
      <TeacherCourseView courseId={courseId} />
    </DashboardLayout>
  );
}
