import { useAuth } from "@/contexts/auth-context";
import {
  type ApiResponse,
  type Course,
  type CourseCreateRequest,
  CourseStatus,
  type CourseUpdateRequest,
  type GetTeacherCoursesParams,
  type PaginatedResponse,
  type TeacherCourseDetailDto,
} from "@/types/course.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Backend response structure for teacher courses
interface TeacherCoursesApiResponse {
  status: string;
  data: Course[]; // Backend returns array directly
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// API Functions
const createCourse = async (
  courseData: CourseCreateRequest,
  token: string,
): Promise<Course> => {
  const dataWithPrice = {
    ...courseData,
    price: courseData.price ? courseData.price.toFixed(2) : "0.00",
  };

  const response = await fetch(`${API_BASE_URL}/teacher/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dataWithPrice),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  const result: ApiResponse<Course> = await response.json();
  return result.data;
};

const getTeacherCourses = async (
  params: GetTeacherCoursesParams,
  token: string,
): Promise<PaginatedResponse<Course>> => {
  const {
    courseStatus = CourseStatus.PUBLISHED,
    page = 0,
    size = 6,
    sortBy = "createdAt",
    sortDir = "desc",
  } = params;

  const searchParams = new URLSearchParams({
    courseStatus,
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDir,
  });

  const response = await fetch(
    `${API_BASE_URL}/teacher/courses/my-courses?${searchParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  // Parse the actual backend response structure
  const apiResponse: TeacherCoursesApiResponse = await response.json();

  // Convert to PaginatedResponse format that frontend expects
  const paginatedResponse: PaginatedResponse<Course> = {
    content: apiResponse.data, // Backend returns courses array in data field
    totalElements: apiResponse.pagination.totalElements,
    totalPages: apiResponse.pagination.totalPages,
    size: size,
    number: apiResponse.pagination.currentPage,
    first: apiResponse.pagination.currentPage === 0,
    last:
      apiResponse.pagination.currentPage >=
      apiResponse.pagination.totalPages - 1,
    empty: apiResponse.data.length === 0,
  };

  return paginatedResponse;
};

const getCourseDetail = async (
  courseId: string,
  token: string,
): Promise<TeacherCourseDetailDto> => {
  const response = await fetch(`${API_BASE_URL}/teacher/courses/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  const result: ApiResponse<TeacherCourseDetailDto> = await response.json();
  return result.data;
};

const updateCourse = async (
  courseId: string,
  courseData: CourseUpdateRequest,
  token: string,
): Promise<Course> => {
  const dataWithPrice = {
    ...courseData,
    price: courseData.price ? courseData.price.toFixed(2) : undefined,
  };

  const response = await fetch(`${API_BASE_URL}/teacher/courses/${courseId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dataWithPrice),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  const result: ApiResponse<Course> = await response.json();
  return result.data;
};

const publishCourse = async (
  courseId: string,
  token: string,
): Promise<Course> => {
  const response = await fetch(
    `${API_BASE_URL}/teacher/courses/${courseId}/publish`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  const result: ApiResponse<Course> = await response.json();
  return result.data;
};

const archiveCourse = async (
  courseId: string,
  token: string,
): Promise<Course> => {
  const response = await fetch(
    `${API_BASE_URL}/teacher/courses/${courseId}/archive`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  const result: ApiResponse<Course> = await response.json();
  return result.data;
};

const deleteCourse = async (courseId: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/teacher/courses/${courseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    );
  }
};

// Custom Hooks
export const useCreateCourse = () => {
  const { accessToken, user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseData: CourseCreateRequest) => {
      if (!accessToken || !user || !hasRole) {
        throw new ApiError(401, "Authentication required");
      }
      return createCourse(courseData, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
    },
    onError: (error) => {
      console.error("Failed to create course:", error);
    },
  });
};

export const useTeacherCourses = (params: GetTeacherCoursesParams = {}) => {
  const { accessToken, user, hasRole } = useAuth();

  return useQuery({
    queryKey: ["teacher-courses", JSON.stringify(params)],
    queryFn: () => {
      if (!accessToken || !user || !hasRole) {
        throw new ApiError(401, "Authentication required");
      }
      return getTeacherCourses(params, accessToken);
    },
    enabled: !!accessToken && !!user && hasRole,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useCourseDetail = (courseId: string) => {
  const { accessToken, user, hasRole } = useAuth();

  return useQuery({
    queryKey: ["course-detail", courseId],
    queryFn: () => {
      if (!accessToken || !user || !hasRole) {
        throw new ApiError(401, "Authentication required");
      }
      return getCourseDetail(courseId, accessToken);
    },
    enabled: !!accessToken && !!user && hasRole && !!courseId,
  });
};

export const useUpdateCourse = () => {
  const { accessToken, user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      courseData,
    }: { courseId: string; courseData: CourseUpdateRequest }) => {
      if (!accessToken || !user || !hasRole) {
        throw new ApiError(401, "Authentication required");
      }
      return updateCourse(courseId, courseData, accessToken);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
      queryClient.invalidateQueries({ queryKey: ["course-detail", courseId] });
    },
  });
};

export const usePublishCourse = () => {
  const { accessToken, user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => {
      if (!accessToken || !user || !hasRole) {
        throw new ApiError(401, "Authentication required");
      }
      return publishCourse(courseId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
    },
  });
};

export const useArchiveCourse = () => {
  const { accessToken, user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => {
      if (!accessToken || !user || !hasRole) {
        throw new ApiError(401, "Authentication required");
      }
      return archiveCourse(courseId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
    },
  });
};

export const useDeleteCourse = () => {
  const { accessToken, user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => {
      if (!accessToken || !user || !hasRole) {
        throw new ApiError(401, "Authentication required");
      }
      return deleteCourse(courseId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
    },
  });
};

export { ApiError };
