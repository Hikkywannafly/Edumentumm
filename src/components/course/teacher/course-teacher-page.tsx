import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { TeacherCourseTable } from "./teacher-course-table";

export function CourseTeacherPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">Quản lý khóa học</h1>
          <p className="mt-1 text-muted-foreground">
            Tạo và quản lý các khóa học của bạn
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Khóa học mới
        </Button>
      </div>

      <Suspense fallback={<div>Đang tải...</div>}>
        <TeacherCourseTable courses={[]} />
      </Suspense>
    </div>
  );
}
