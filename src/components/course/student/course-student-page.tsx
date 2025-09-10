import { mockCourses } from "@/lib/mock-data/courses";
import { Suspense, useState } from "react";
import type { ICourseFilter } from "../../../types/course.type";
import { CourseCard } from "./course-card";
import { CourseFilter } from "./course-filter";

export function CourseStudentPage() {
  const [filter, setFilter] = useState<ICourseFilter>({
    search: "",
    tags: [],
    level: [],
    sortBy: "popular",
  });

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main content */}
        <main className="min-h-[400px] flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-bold text-2xl text-gray-900">My Courses</h1>
              <p className="my-4 text-muted-foreground">
                Manage and track your learning progress
              </p>
              {/* Sidebar filter */}
              <aside className="w-full flex-shrink-0 lg:w-64">
                <CourseFilter filter={filter} onFilterChange={setFilter} />
              </aside>
            </div>
          </div>

          <Suspense fallback={<div>Loading courses...</div>}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
