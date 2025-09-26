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
  data: Course[];
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

// Utility function to validate courseId
const validateCourseId = (courseId: number | undefined): number => {
  if (!courseId && courseId !== 0) {
    throw new ApiError(400, "Invalid course ID provided");
  }
  return courseId;
};

// API Functions
const createCourse = async (
  courseData: CourseCreateRequest,
  token: string,
): Promise<Course> => {
  const dataWithPrice = {
    ...courseData,
    price: courseData.price ? Number(courseData.price) : 0,
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
    courseStatus = CourseStatus.DRAFT,
    page = 0,
    size = 6,
    sortBy = "updatedAt",
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
        "Content-Type": "application/json",
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

  const apiResponse: TeacherCoursesApiResponse = await response.json();

  const paginatedResponse: PaginatedResponse<Course> = {
    content: apiResponse.data,
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

const getTeacherCourseDetail = async (
  courseId: number,
  token: string,
): Promise<TeacherCourseDetailDto> => {
  const validatedCourseId = validateCourseId(courseId);

  const response = await fetch(
    `${API_BASE_URL}/teacher/courses/${validatedCourseId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
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

  const result: ApiResponse<TeacherCourseDetailDto> = await response.json();
  return result.data;
};

const updateCourse = async (
  courseId: number,
  courseData: CourseUpdateRequest,
  token: string,
): Promise<Course> => {
  const validatedCourseId = validateCourseId(courseId);

  const dataWithPrice = {
    ...courseData,
    price: courseData.price ? Number(courseData.price) : undefined,
  };

  const response = await fetch(
    `${API_BASE_URL}/teacher/courses/${validatedCourseId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataWithPrice),
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

const publishCourse = async (
  courseId: number,
  token: string,
): Promise<Course> => {
  const validatedCourseId = validateCourseId(courseId);

  const response = await fetch(
    `${API_BASE_URL}/teacher/courses/${validatedCourseId}/publish`,
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
  courseId: number,
  token: string,
): Promise<Course> => {
  const validatedCourseId = validateCourseId(courseId);

  const response = await fetch(
    `${API_BASE_URL}/teacher/courses/${validatedCourseId}/archive`,
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

const deleteCourse = async (courseId: number, token: string): Promise<void> => {
  const validatedCourseId = validateCourseId(courseId);

  const response = await fetch(
    `${API_BASE_URL}/teacher/courses/${validatedCourseId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
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
    queryKey: ["teacher-courses", params],
    queryFn: () => {
      if (!accessToken || !user || !hasRole) {
        throw new ApiError(401, "Authentication required");
      }
      return getTeacherCourses(params, accessToken);
    },
    enabled: !!accessToken && !!user && hasRole,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useTeacherCourseDetail = (courseId: number) => {
  const { accessToken, user, hasRole } = useAuth();

  return useQuery({
    queryKey: ["teacher-course-detail", courseId],
    queryFn: () => {
      if (!accessToken || !user || !hasRole) {
        throw new ApiError(401, "Authentication required");
      }
      if (!courseId || courseId === undefined) {
        throw new ApiError(400, "Course ID is required");
      }
      return getTeacherCourseDetail(courseId, accessToken);
    },
    enabled:
      !!accessToken &&
      !!user &&
      hasRole &&
      !!courseId &&
      courseId !== undefined,
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 400)
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useUpdateCourse = () => {
  const { accessToken, user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      courseData,
    }: {
      courseId: number;
      courseData: CourseUpdateRequest;
    }) => {
      if (!accessToken || !user || !hasRole) {
        throw new ApiError(401, "Authentication required");
      }
      return updateCourse(courseId, courseData, accessToken);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
      queryClient.invalidateQueries({
        queryKey: ["teacher-course-detail", courseId],
      });
    },
  });
};

export const usePublishCourse = () => {
  const { accessToken, user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: number) => {
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
    mutationFn: (courseId: number) => {
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
    mutationFn: (courseId: number) => {
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
