"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import type {
  ApiResponse,
  Course,
  ICourseFilter,
  PaginatedResponse,
} from "@/types/course.type";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { CourseCard } from "./course-card";
import { CourseFilter } from "./course-filter";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// API function to fetch published courses
const fetchPublishedCourses = async (
  page = 0,
  size = 6,
  token?: string,
): Promise<PaginatedResponse<Course>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/student/courses/published?${params}`,
    {
      headers,
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  const result: ApiResponse<PaginatedResponse<Course>> = await response.json();
  return result.data;
};

// Component to render skeleton loading cards
function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Skeleton className="aspect-video w-full" />
      <div className="space-y-3 p-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function CourseStudentPage() {
  const [filter, setFilter] = useState<ICourseFilter>({
    search: "",
    tags: [],
    level: [],
    sortBy: "popular",
  });
  const [currentPage, setCurrentPage] = useState(0);
  const { accessToken } = useAuth();

  // Fetch courses with React Query
  const {
    data: coursesResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["published-courses", currentPage],
    queryFn: () =>
      fetchPublishedCourses(currentPage, 6, accessToken || undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter courses based on current filter state
  const filteredCourses = useMemo(() => {
    if (!coursesResponse?.content) return [];

    let filtered = [...coursesResponse.content];

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchLower) ||
          course.shortDescription.toLowerCase().includes(searchLower) ||
          course.teacher.name.toLowerCase().includes(searchLower),
      );
    }

    // Tags filter
    if (filter.tags.length > 0) {
      filtered = filtered.filter((course) => {
        const courseTags =
          course.courseTagNames ||
          course.courseTags?.map((tag) => tag.name) ||
          [];
        return filter.tags.some((filterTag) =>
          courseTags.some((courseTag) =>
            courseTag.toLowerCase().includes(filterTag.toLowerCase()),
          ),
        );
      });
    }

    // Level filter
    if (filter.level.length > 0) {
      filtered = filtered.filter((course) =>
        filter.level.includes(course.courseLevel),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filter.sortBy) {
        case "price":
          return a.price - b.price;
        case "popular":
          return b.totalEnrollments - a.totalEnrollments;
        case "level": {
          const levelOrder = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3 };
          return (
            (levelOrder[a.courseLevel as keyof typeof levelOrder] || 0) -
            (levelOrder[b.courseLevel as keyof typeof levelOrder] || 0)
          );
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [coursesResponse?.content, filter]);

  // Get unique tags for filter options
  const availableTags = useMemo(() => {
    if (!coursesResponse?.content) return [];

    const tagSet = new Set<string>();
    coursesResponse.content.map((course) => {
      const courseTags =
        course.courseTagNames ||
        course.courseTags?.map((tag) => tag.name) ||
        [];
      courseTags.map((tag) => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
  }, [coursesResponse?.content]);

  // Handle pagination
  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const hasMorePages = coursesResponse ? !coursesResponse.last : false;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="mb-2 font-bold text-3xl text-gray-900">
          Discover Courses
        </h1>
        <p className="text-muted-foreground">
          Explore our wide range of courses and start your learning journey
        </p>
      </div>

      {/* Filter Section */}
      <div className="mb-8">
        <CourseFilter
          filter={filter}
          onFilterChange={setFilter}
          availableTags={availableTags}
        />
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load courses: {(error as Error).message}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Results Count */}
      {!isLoading && coursesResponse && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredCourses.length} of {coursesResponse.totalElements}{" "}
            courses
            {filter.search && ` for "${filter.search}"`}
          </p>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && currentPage === 0
          ? // Show skeleton loading for initial load
            Array.from({ length: 8 }).map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))
          : // Show actual courses
            filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
      </div>

      {/* Empty State */}
      {!isLoading && filteredCourses.length === 0 && coursesResponse && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 h-16 w-16 text-muted-foreground">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <h3 className="mb-2 font-semibold text-lg">No courses found</h3>
          <p className="mb-4 max-w-md text-muted-foreground">
            {filter.search || filter.tags.length > 0 || filter.level.length > 0
              ? "Try adjusting your search criteria or clearing some filters."
              : "No courses are available at the moment."}
          </p>
          {(filter.search ||
            filter.tags.length > 0 ||
            filter.level.length > 0) && (
            <Button
              variant="outline"
              onClick={() =>
                setFilter({
                  search: "",
                  tags: [],
                  level: [],
                  sortBy: "popular",
                })
              }
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Load More Button */}
      {!isLoading && hasMorePages && filteredCourses.length > 0 && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Courses"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
