import StudentCourseDetail from "@/components/course/student/student-course-detail";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";

export default function StudentCourseDetailPage({
  params,
}: { params: { courseId: number } }) {
  const { courseId } = params;

  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader title="Course Details" showThemeToggle={true} />

      {/* Main content */}
      <StudentCourseDetail courseId={courseId} />
    </DashboardLayout>
  );
}
