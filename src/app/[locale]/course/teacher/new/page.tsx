import { CreateNewCourse } from "@/components/course/teacher/create-new-course";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";

export default function CreateCoursePage() {
  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader title="Create New Course" showThemeToggle={true} />

      {/* Main content */}
      <CreateNewCourse />
    </DashboardLayout>
  );
}
