import type { Course, CourseLevel } from "@/types/course.type";
import { useQuery } from "@tanstack/react-query";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface QueryResult<T> {
  status: string;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

interface GetStudentCoursesParams {
  keyword?: string;
  level?: CourseLevel;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// API functions
async function fetchPublishedCourses({
  page = 0,
  size = 6,
}: GetStudentCoursesParams): Promise<QueryResult<Course>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const response = await fetch(
    `${API_BASE_URL}/student/courses/published?${params}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result;
}

async function fetchFilteredCourses({
  level,
  minPrice,
  maxPrice,
  page = 0,
  size = 6,
}: GetStudentCoursesParams): Promise<QueryResult<Course>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy: "createdAt",
    sortDir: "desc",
  });

  if (level) params.append("level", level);
  if (minPrice !== undefined) params.append("minPrice", minPrice.toString());
  if (maxPrice !== undefined) params.append("maxPrice", maxPrice.toString());

  const response = await fetch(
    `${API_BASE_URL}/student/courses/filter?${params}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result;
}

async function fetchSearchCourses({
  keyword,
  page = 0,
  size = 6,
}: GetStudentCoursesParams): Promise<QueryResult<Course>> {
  if (!keyword || keyword.trim() === "") {
    throw new Error("Search keyword is required");
  }

  const params = new URLSearchParams({
    keyword: keyword.trim(),
    page: page.toString(),
    size: size.toString(),
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const response = await fetch(
    `${API_BASE_URL}/student/courses/search?${params}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result;
}

// React Query hooks
export function usePublishedCourses(params: GetStudentCoursesParams = {}) {
  const hasFilters =
    params.level ||
    params.minPrice !== undefined ||
    params.maxPrice !== undefined;
  const hasKeyword = params.keyword && params.keyword.trim() !== "";

  return useQuery({
    queryKey: ["courses", "published", params],
    queryFn: () => fetchPublishedCourses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !hasFilters && !hasKeyword, // Only run if there are no filters and no search
    retry: (failureCount, error: any) => {
      if (error?.status === 400 || error?.status === 404) return false;
      return failureCount < 3;
    },
  });
}

export function useFilterCourses(params: GetStudentCoursesParams) {
  const hasFilters =
    params.level ||
    params.minPrice !== undefined ||
    params.maxPrice !== undefined;
  const hasKeyword = params.keyword && params.keyword.trim() !== "";

  return useQuery({
    queryKey: ["courses", "filter", params],
    queryFn: () => fetchFilteredCourses(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: hasFilters && !hasKeyword, // Only run if there are filters and no search
    retry: (failureCount, error: any) => {
      if (error?.status === 400 || error?.status === 404) return false;
      return failureCount < 3;
    },
  });
}

export function useSearchCourses(params: GetStudentCoursesParams) {
  const hasKeyword = params.keyword && params.keyword.trim() !== "";

  return useQuery({
    queryKey: ["courses", "search", params],
    queryFn: () => fetchSearchCourses(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!hasKeyword, // Only run if there is a search keyword
    retry: (failureCount, error: any) => {
      if (error?.status === 400 || error?.status === 404) return false;
      return failureCount < 3;
    },
  });
}
