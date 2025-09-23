import { useAuth } from "@/contexts/auth-context";
import type {
  ApiResponse,
  Course,
  CourseLevel,
  FilterOptions,
} from "@/types/course.type";
import { useQuery } from "@tanstack/react-query";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

async function fetchCourses(
  filters: FilterOptions,
): Promise<ApiResponse<Course[]>> {
  const { search, level, minPrice, maxPrice, page = 0, size = 6 } = filters;

  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/student/courses`;

  if (search && search.trim() !== "") {
    url += `/search?keyword=${encodeURIComponent(search)}`;
  } else if (level || minPrice !== undefined || maxPrice !== undefined) {
    url += "/filter";
    const params = new URLSearchParams();
    if (level) params.append("level", level);
    if (minPrice !== undefined) params.append("minPrice", minPrice.toString());
    if (maxPrice !== undefined) params.append("maxPrice", maxPrice.toString());
    url += `?${params.toString()}`;
  } else {
    url += "/published";
  }

  // thêm page & size
  const hasQuery = url.includes("?");
  url += `${hasQuery ? "&" : "?"}page=${page}&size=${size}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
}

export function useCourses(filters: FilterOptions) {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: () => fetchCourses(filters),
  });
}

interface GetStudentCoursesParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  level?: CourseLevel;
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
  tagNames?: string[];
}

// API functions
export const getPublishedCourses = async (
  params: GetStudentCoursesParams,
  token?: string,
) => {
  const { page = 0, size = 6, sortBy = "createdAt", sortDir = "desc" } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDir,
  });

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/student/courses/published?${searchParams}`,
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

  return response.json();
};

export const searchCourses = async (
  params: GetStudentCoursesParams,
  token?: string,
) => {
  const {
    keyword = "",
    page = 0,
    size = 6,
    sortBy = "createdAt",
    sortDir = "desc",
  } = params;

  const searchParams = new URLSearchParams({
    keyword,
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDir,
  });

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/student/courses/search?${searchParams}`,
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

  return response.json();
};

export const filterCourses = async (
  params: GetStudentCoursesParams,
  token?: string,
) => {
  const {
    level,
    minPrice,
    maxPrice,
    page = 0,
    size = 6,
    sortBy = "createdAt",
    sortDir = "desc",
  } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDir,
  });

  // Chỉ thêm level nếu có giá trị cụ thể (không phải undefined)
  if (level) {
    searchParams.append("level", level);
  }

  // Thêm cả minPrice và maxPrice để filter trong khoảng
  if (minPrice !== undefined) {
    searchParams.append("minPrice", minPrice.toString());
  }

  if (maxPrice !== undefined) {
    searchParams.append("maxPrice", maxPrice.toString());
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log(
    "Filter API call:",
    `${API_BASE_URL}/student/courses/filter?${searchParams}`,
  );

  const response = await fetch(
    `${API_BASE_URL}/student/courses/filter?${searchParams}`,
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

  return response.json();
};

export const getCoursesByTags = async (
  params: GetStudentCoursesParams,
  token?: string,
) => {
  const { tagNames = [], page = 0, size = 6 } = params;

  const searchParams = new URLSearchParams();
  tagNames.map((tag) => {
    searchParams.append("tagCourseNames", tag);
  });
  searchParams.append("page", page.toString());
  searchParams.append("size", size.toString());

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/student/courses/tags?${searchParams}`,
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

  return response.json();
};

// React Query Hooks
export const usePublishedCourses = (
  params: GetStudentCoursesParams = {},
  options = {},
) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["published-courses", params],
    queryFn: () => getPublishedCourses(params, accessToken || undefined),
    ...options,
  });
};

export const useSearchCourses = (
  params: GetStudentCoursesParams,
  options = {},
) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["search-courses", params],
    queryFn: () => searchCourses(params, accessToken || undefined),
    enabled: !!params.keyword && params.keyword.trim() !== "",
    ...options,
  });
};

export const useFilterCourses = (
  params: GetStudentCoursesParams,
  options = {},
) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["filter-courses", params],
    queryFn: () => filterCourses(params, accessToken || undefined),
    ...options,
  });
};

export const useCoursesByTags = (
  params: GetStudentCoursesParams,
  options = {},
) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["courses-by-tags", params],
    queryFn: () => getCoursesByTags(params, accessToken || undefined),
    enabled: !!params.tagNames?.length,
    ...options,
  });
};
