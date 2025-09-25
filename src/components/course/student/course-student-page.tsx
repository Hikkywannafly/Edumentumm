"use client";

import { Button } from "@/components/ui/button";
import {
  useFilterCourses,
  usePublishedCourses,
  useSearchCourses,
} from "@/hooks/course/use-student-courses";
import { toast } from "@/hooks/use-toast";
import type { Course, CourseLevel } from "@/types/course.type";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
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

  // Determine active query type
  const hasSearch = filters.search && filters.search.trim() !== "";
  const hasFilters =
    filters.level ||
    (filters.minPrice !== undefined && filters.minPrice > 0) ||
    (filters.maxPrice !== undefined && filters.maxPrice < 1000);

  // Published courses query (default)
  const publishedQuery = usePublishedCourses({
    page: filters.page,
    size: filters.size,
  });

  // Filtered courses query
  const filteredQuery = useFilterCourses({
    level: filters.level,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    page: filters.page,
    size: filters.size,
  });

  // Search courses query
  const searchQuery = useSearchCourses({
    keyword: filters.search,
    page: filters.page,
    size: filters.size,
  });

  // Determine which query to use
  const activeQuery = hasSearch
    ? searchQuery
    : hasFilters
      ? filteredQuery
      : publishedQuery;

  const handleFilterChange = useCallback(
    (newFilters: Partial<FilterOptions>) => {
      console.log("Applying filters:", newFilters);
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        page: 0, // Reset page when filters change
      }));
    },
    [],
  );

  const { isLoading, error, data } = activeQuery;

  // Handle errors
  if (error) {
    console.error("Course loading error:", error);
    toast({
      title: "Error",
      description: "Failed to load courses. Please try again.",
      variant: "destructive",
    });
  }

  const getFilterSummary = () => {
    const activeFilters = [];

    if (hasSearch) activeFilters.push(`Search: "${filters.search}"`);
    if (filters.level) activeFilters.push(`Level: ${filters.level}`);
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const min = filters.minPrice || 0;
      const max = filters.maxPrice || "any";
      activeFilters.push(`Price: $${min}-$${max}`);
    }

    return activeFilters.length > 0
      ? `Filters: ${activeFilters.join(", ")}`
      : "Showing all courses";
  };

  const handleClearFilters = () => {
    setFilters({
      page: 0,
      size: 6,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="w-full md:w-64">
          <CourseFilter
            onFilterChange={handleFilterChange}
            maxPriceValue={1000}
          />
        </aside>

        <main className="flex-1">
          {/* Filter summary */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              {getFilterSummary()}
            </div>
            {(hasSearch || hasFilters) && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear all filters
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-center">
                <p className="mb-2 text-destructive">Error loading courses</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => activeQuery.refetch()}
                >
                  Try again
                </Button>
              </div>
            </div>
          ) : data?.data?.length ? (
            <>
              <div className="mb-4 text-muted-foreground text-sm">
                Found {data.data.length} course(s)
              </div>
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {data.data.map((course: Course) => (
                  <CourseCard
                    key={course.courseId || course.id}
                    course={course}
                  />
                ))}
              </div>

              {/* Pagination info */}
              {data.pagination && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    Page {data.pagination.currentPage + 1} of{" "}
                    {data.pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!data.pagination.hasPrevious}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: prev.page ? prev.page - 1 : 0,
                        }))
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!data.pagination.hasNext}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                        }))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <div className="text-center">
                <p className="mb-2 text-muted-foreground">No courses found</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
