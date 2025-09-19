"use client";

import {
  useFilterCourses,
  usePublishedCourses,
  useSearchCourses,
} from "@/hooks/course/use-student-courses";
import type { Course, CourseLevel } from "@/types/course.type";
import { useState } from "react";
import { useCallback } from "react";
import { LoadingSpinner } from "../../../components/ui/loading-spinner";
import { CourseCard } from "./course-card";
import { CourseFilter } from "./course-filter";

interface FilterOptions {
  level?: CourseLevel;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  size?: number;
}

export default function CourseStudentPage() {
  const [filters, setFilters] = useState<FilterOptions>({
    page: 0,
    size: 6,
  });

  // Determine which query to use based on active filters
  const hasSearch = filters.search && filters.search.trim() !== "";
  const hasLevelFilter = filters.level !== undefined;
  const hasPriceFilter =
    (filters.minPrice !== undefined && filters.minPrice > 0) ||
    (filters.maxPrice !== undefined && filters.maxPrice < 1000);

  // Published courses (default - load all courses)
  const {
    data: publishedCoursesData,
    isLoading: isLoadingPublished,
    error: publishedError,
  } = usePublishedCourses(
    !hasSearch && !hasLevelFilter && !hasPriceFilter
      ? filters
      : { page: 0, size: 0 },
  );

  // Filter courses (when level or price filters are applied)
  const {
    data: filteredCoursesData,
    isLoading: isLoadingFiltered,
    error: filteredError,
  } = useFilterCourses(
    {
      level: filters.level,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      page: filters.page,
      size: filters.size,
    },
    {
      enabled: !hasSearch && (hasLevelFilter || hasPriceFilter),
    },
  );

  // Search courses (when search is active)
  const {
    data: searchCoursesData,
    isLoading: isLoadingSearch,
    error: searchError,
  } = useSearchCourses(
    {
      keyword: filters.search,
      page: filters.page,
      size: filters.size,
    },
    {
      enabled: hasSearch, // Chỉ enable khi có search keyword
    },
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<FilterOptions>) => {
      console.log("Filter change:", newFilters);

      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        page: 0, // Reset page when filters change
      }));
    },
    [],
  );

  // Determine which data to show
  let coursesToShow: Course[] | undefined;
  let isLoading = false;
  let error = null;

  if (hasSearch) {
    coursesToShow = searchCoursesData?.data;
    isLoading = isLoadingSearch;
    error = searchError;
  } else if (hasLevelFilter || hasPriceFilter) {
    coursesToShow = filteredCoursesData?.data;
    isLoading = isLoadingFiltered;
    error = filteredError;
  } else {
    coursesToShow = publishedCoursesData?.data;
    isLoading = isLoadingPublished;
    error = publishedError;
  }

  const getFilterSummary = () => {
    const activeFilters = [];

    if (hasSearch) activeFilters.push(`Search: "${filters.search}"`);
    if (hasLevelFilter) activeFilters.push(`Level: ${filters.level}`);
    if (hasPriceFilter) {
      const min = filters.minPrice || 0;
      const max = filters.maxPrice || 1000;
      activeFilters.push(`Price: $${min}-$${max}`);
    }

    return activeFilters.length > 0
      ? `Filters: ${activeFilters.join(", ")}`
      : "Showing all courses";
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="w-full md:w-64">
          <CourseFilter onFilterChange={handleFilterChange} />
        </aside>

        <main className="flex-1">
          {/* Filter summary */}
          <div className="mb-4 text-muted-foreground text-sm">
            {getFilterSummary()}
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-center">
                <p className="mb-2 text-red-500">Error loading courses</p>
                <p className="text-muted-foreground text-sm">
                  {(error as Error).message}
                </p>
              </div>
            </div>
          ) : coursesToShow?.length ? (
            <>
              <div className="mb-4 text-muted-foreground text-sm">
                Found {coursesToShow.length} course(s)
              </div>
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {coursesToShow.map((course: Course) => (
                  <CourseCard
                    key={course.courseId || course.id || Math.random()}
                    course={course}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <div className="text-center">
                <p className="mb-2 text-muted-foreground">No courses found</p>
                {(hasSearch || hasLevelFilter || hasPriceFilter) && (
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your search or filters
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
