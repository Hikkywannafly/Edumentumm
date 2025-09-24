import { useAuth } from "@/contexts/auth-context";
import type {
  EnrollmentStatus,
  RatingCreateRequestDto,
} from "@/types/course.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Enrollment API functions
export const enrollInCourse = async (courseId: number, token?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/student/courses/${courseId}/enroll`,
    {
      method: "POST",
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

export const unenrollFromCourse = async (courseId: number, token?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/student/courses/${courseId}/enroll`,
    {
      method: "DELETE",
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

interface GetStudentEnrollmentsParams {
  enrollmentStatus?: EnrollmentStatus;
  page?: number;
  size?: number;
}

export const getStudentEnrollments = async (
  params: GetStudentEnrollmentsParams,
  token?: string,
) => {
  const { enrollmentStatus, page = 0, size = 6 } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (enrollmentStatus) {
    searchParams.append("enrollmentStatus", enrollmentStatus);
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/student/courses/my-enrollments?${searchParams}`,
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

export const updateEnrollmentProgress = async (
  enrollmentId: string | number,
  completedLessons?: number,
  completedExercises?: number,
  token?: string,
) => {
  const searchParams = new URLSearchParams();

  if (completedLessons !== undefined) {
    searchParams.append("completedLessons", completedLessons.toString());
  }

  if (completedExercises !== undefined) {
    searchParams.append("completedExercises", completedExercises.toString());
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/student/courses/enrollments/${enrollmentId}/progress?${searchParams}`,
    {
      method: "PATCH",
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

// Rating API functions
export const rateCourse = async (
  courseId: number,
  ratingData: RatingCreateRequestDto,
  token?: string,
) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/student/courses/${courseId}/ratings`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(ratingData),
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

export const updateCourseRating = async (
  courseId: number,
  ratingData: RatingCreateRequestDto,
  token?: string,
) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/student/courses/${courseId}/ratings`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify(ratingData),
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

export const deleteCourseRating = async (courseId: number, token?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/student/courses/${courseId}/ratings`,
    {
      method: "DELETE",
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

interface GetCourseRatingsParams {
  courseId: number;
  page?: number;
  size?: number;
}

export const getCourseRatings = async (
  params: GetCourseRatingsParams,
  token?: string,
) => {
  const { courseId, page = 0, size = 5 } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/student/courses/${courseId}/ratings?${searchParams}`,
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

export const getUserCourseRating = async (courseId: number, token?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/student/courses/${courseId}/ratings/my-rating`,
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

// React Query Hooks for Enrollment
export const useEnrollInCourse = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: number) =>
      enrollInCourse(courseId, accessToken || undefined),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["course-detail"] });
      queryClient.invalidateQueries({ queryKey: ["student-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["published-courses"] });
    },
  });
};

export const useUnenrollFromCourse = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: number) =>
      unenrollFromCourse(courseId, accessToken || undefined),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["course-detail"] });
      queryClient.invalidateQueries({ queryKey: ["student-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrolled-course-detail"] });
    },
  });
};

export const useStudentEnrollments = (
  params: GetStudentEnrollmentsParams = {},
  options = {},
) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["student-enrollments", params],
    queryFn: () => getStudentEnrollments(params, accessToken || undefined),
    ...options,
  });
};

export const useUpdateEnrollmentProgress = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      completedLessons,
      completedExercises,
    }: {
      enrollmentId: string | number;
      completedLessons?: number;
      completedExercises?: number;
    }) =>
      updateEnrollmentProgress(
        enrollmentId,
        completedLessons,
        completedExercises,
        accessToken || undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrolled-course-detail"] });
    },
  });
};

// React Query Hooks for Rating
export const useRateCourse = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      ratingData,
    }: {
      courseId: number;
      ratingData: RatingCreateRequestDto;
    }) => rateCourse(courseId, ratingData, accessToken || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-detail"] });
      queryClient.invalidateQueries({ queryKey: ["course-ratings"] });
      queryClient.invalidateQueries({ queryKey: ["user-course-rating"] });
      queryClient.invalidateQueries({ queryKey: ["enrolled-course-detail"] });
    },
  });
};

export const useUpdateCourseRating = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      ratingData,
    }: {
      courseId: number;
      ratingData: RatingCreateRequestDto;
    }) => updateCourseRating(courseId, ratingData, accessToken || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-detail"] });
      queryClient.invalidateQueries({ queryKey: ["course-ratings"] });
      queryClient.invalidateQueries({ queryKey: ["user-course-rating"] });
      queryClient.invalidateQueries({ queryKey: ["enrolled-course-detail"] });
    },
  });
};

export const useDeleteCourseRating = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: number) =>
      deleteCourseRating(courseId, accessToken || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-detail"] });
      queryClient.invalidateQueries({ queryKey: ["course-ratings"] });
      queryClient.invalidateQueries({ queryKey: ["user-course-rating"] });
      queryClient.invalidateQueries({ queryKey: ["enrolled-course-detail"] });
    },
  });
};

export const useCourseRatings = (
  courseId: number,
  params: Omit<GetCourseRatingsParams, "courseId"> = {},
  options = {},
) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["course-ratings", courseId, params],
    queryFn: () =>
      getCourseRatings({ courseId, ...params }, accessToken || undefined),
    enabled: !!courseId,
    ...options,
  });
};

export const useUserCourseRating = (courseId: number, options = {}) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["user-course-rating", courseId],
    queryFn: () => getUserCourseRating(courseId, accessToken || undefined),
    enabled: !!courseId,
    ...options,
  });
};
