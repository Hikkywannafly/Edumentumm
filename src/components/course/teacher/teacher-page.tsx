"use client";

import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { useTeacherCourses } from "@/hooks/course/use-teacher-courses";
import {
  CourseStatus,
  type GetTeacherCoursesParams,
} from "@/types/course.type";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { TeacherCourseTable } from "./teacher-course-table";

export function TeacherPage() {
  // State for filtering courses
  const [courseStatus, setCourseStatus] = useState<CourseStatus>(
    CourseStatus.DRAFT,
  );
  const [currentPage, setCurrentPage] = useState(0);

  const queryParams: GetTeacherCoursesParams = useMemo(
    () => ({
      courseStatus,
      page: currentPage,
      size: 6,
      sortBy: "updatedAt",
      sortDir: "desc",
    }),
    [courseStatus, currentPage],
  );

  // Use the hook to fetch teacher courses
  const {
    data: paginatedResponse,
    isLoading,
    error,
    refetch,
  } = useTeacherCourses(queryParams);

  // Extract courses from paginated response
  const courses = paginatedResponse?.content || [];
  const totalPages = paginatedResponse?.totalPages || 0;
  const totalElements = courses.length;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">Manage Courses</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage your courses ({totalElements} total)
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-md border">
            <Button
              variant={
                courseStatus === CourseStatus.DRAFT ? "default" : "outline"
              }
              size="sm"
              onClick={() => {
                setCourseStatus(CourseStatus.DRAFT);
                setCurrentPage(0);
              }}
              className="rounded-r-none border-r-0"
            >
              Draft
            </Button>
            <Button
              variant={
                courseStatus === CourseStatus.PUBLISHED ? "default" : "outline"
              }
              size="sm"
              onClick={() => {
                setCourseStatus(CourseStatus.PUBLISHED);
                setCurrentPage(0);
              }}
              className="rounded-none border-r-0"
            >
              Published
            </Button>
            <Button
              variant={
                courseStatus === CourseStatus.ARCHIVED ? "default" : "outline"
              }
              size="sm"
              onClick={() => {
                setCourseStatus(CourseStatus.ARCHIVED);
                setCurrentPage(0);
              }}
              className="rounded-l-none"
            >
              Archived
            </Button>
          </div>
          <LocalizedLink href="/course/teacher/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Course
            </Button>
          </LocalizedLink>
        </div>
      </div>

      {/* Pass real data to table */}
      <TeacherCourseTable
        courses={courses}
        isLoading={isLoading}
        error={error}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0 || isLoading}
          >
            Previous
          </Button>

          <span className="flex items-center px-4 text-muted-foreground text-sm">
            Page {currentPage + 1} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
            disabled={currentPage >= totalPages - 1 || isLoading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Refresh button for debugging */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh Data
          </Button>
        </div>
      )}
    </div>
  );
}
