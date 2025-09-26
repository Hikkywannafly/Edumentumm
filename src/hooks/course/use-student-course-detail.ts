import { useAuth } from "@/contexts/auth-context";
import type {
  EnrolledStudentCourseDetailDto,
  PublicCourseDetailDto,
  TeacherCourseDetailDto,
} from "@/types/course.type";
import { useQuery } from "@tanstack/react-query";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// API functions
export const getCourseDetail = async (courseId: string, token?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/student/courses/${courseId}`, {
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  return response.json();
};

export const getEnrolledCourseDetail = async (
  courseId: string,
  token?: string,
) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/student/courses/${courseId}/enrolled-detail`,
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
export const useCourseDetail = (courseId: string, options = {}) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["course-detail", courseId],
    queryFn: () => getCourseDetail(courseId, accessToken || undefined),
    enabled: !!courseId,
    ...options,
  });
};

export const useEnrolledCourseDetail = (courseId: string, options = {}) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["enrolled-course-detail", courseId],
    queryFn: () => getEnrolledCourseDetail(courseId, accessToken || undefined),
    enabled: !!courseId,
    ...options,
  });
};

// Type guards to help identify the course detail type
export const isEnrolledStudentCourseDetail = (
  data: any,
): data is EnrolledStudentCourseDetailDto => {
  return data && typeof data.enrollmentStatus !== "undefined";
};

export const isPublicCourseDetail = (
  data: any,
): data is PublicCourseDetailDto => {
  return data && typeof data.ratings !== "undefined" && !data.enrollmentStatus;
};

export const isTeacherCourseDetail = (
  data: any,
): data is TeacherCourseDetailDto => {
  return data && typeof data.recentRatings !== "undefined";
};
