import { TeacherCourseEdit } from "@/components/course/teacher/teacher-course-edit";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";

export default async function EditCoursePage({
  params,
}: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader title="Edit Course" showThemeToggle={true} />

      {/* Main content */}
      <TeacherCourseEdit courseId={courseId} />
    </DashboardLayout>
  );
}
