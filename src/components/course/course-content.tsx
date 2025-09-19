"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { AlertTriangle } from "lucide-react";
import CourseStudentPage from "./student/course-student-page";
import { CourseTeacherPage } from "./teacher/course-teacher-page";

export default function CourseContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
              <h3 className="mb-2 font-semibold text-lg">Not Logged In</h3>
              <p className="text-muted-foreground">
                Please log in to access the course.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isStudent = user.roles?.some((role) => role.name === "ROLE_STUDENT");
  const isTeacher = user.roles?.some((role) => role.name === "ROLE_TEACHER");

  if (isStudent) {
    return <CourseStudentPage />;
  }

  if (isTeacher) {
    return <CourseTeacherPage />;
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 font-semibold text-lg">Access Denied</h3>
            <p className="text-muted-foreground">
              You do not have permission to access this page. Please contact the
              administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
