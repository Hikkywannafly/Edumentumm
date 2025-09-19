import { TeacherCourseView } from "@/components/course/teacher/teacher-course-view";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";

export default function EditCoursePage({
  params,
}: { params: { courseId: number } }) {
  const { courseId } = params;

  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader title="Edit Course" showThemeToggle={true} />

      {/* Main content */}
      <TeacherCourseView courseId={courseId} />
    </DashboardLayout>
  );
}
