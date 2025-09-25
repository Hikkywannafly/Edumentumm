import StudentCourseDetail from "@/components/course/student/student-course-detail";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";

export default async function StudentCourseDetailPage({
  params,
}: { params: Promise<{ courseId: number }> }) {
  const { courseId } = await params;

  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader title="Course Details" showThemeToggle={true} />

      {/* Main content */}
      <StudentCourseDetail courseId={courseId} />
    </DashboardLayout>
  );
}
