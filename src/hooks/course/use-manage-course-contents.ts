import type {
  ApiResponse,
  ExerciseCreateRequestDto,
  ExerciseResponseDto,
  LessonCreateRequestDto,
  LessonResponseDto,
  ResourceCreateRequestDto,
  ResourceResponseDto,
} from "@/types/course.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Base API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: `${API_BASE_URL}/teacher/courses`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token interceptor - FIXED: sử dụng 'accessToken' thay vì 'authToken'
api.interceptors.request.use(
  (config) => {
    // Sử dụng accessToken theo auth-context
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No access token found in localStorage");
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor để handle 401/403 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized access - token might be expired");
      // Có thể dispatch một action để refresh token hoặc redirect về login
    } else if (error.response?.status === 403) {
      console.error("Forbidden access - insufficient permissions");
    }
    return Promise.reject(error);
  },
);

// Query Keys
export const courseContentQueryKeys = {
  lessons: (courseId: string) => ["lessons", courseId],
  exercises: (courseId: string) => ["exercises", courseId],
  resources: (courseId: string) => ["resources", courseId],
} as const;

// ============ LESSON HOOKS ============

// Get Course Lessons
export const useGetCourseLessons = (courseId: string) => {
  return useQuery({
    queryKey: courseContentQueryKeys.lessons(courseId),
    queryFn: async (): Promise<LessonResponseDto[]> => {
      const { data } = await api.get<ApiResponse<LessonResponseDto[]>>(
        `/${courseId}/lessons`,
      );
      return data.data;
    },
    enabled: !!courseId,
    retry: (failureCount, error: any) => {
      // Không retry nếu là lỗi 401/403
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Create Lesson
export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      lessonData,
    }: {
      courseId: string;
      lessonData: LessonCreateRequestDto;
    }): Promise<LessonResponseDto> => {
      const { data } = await api.post<ApiResponse<LessonResponseDto>>(
        `/${courseId}/lessons`,
        lessonData,
      );
      return data.data;
    },
    onSuccess: (_, { courseId }) => {
      // Invalidate and refetch lessons for this course
      queryClient.invalidateQueries({
        queryKey: courseContentQueryKeys.lessons(courseId),
      });
      // Also invalidate course details if you have that query
      queryClient.invalidateQueries({
        queryKey: ["course", courseId],
      });
    },
    onError: (error: any) => {
      console.error("Error creating lesson:", error);
      if (error?.response?.status === 403) {
        console.error(
          "Permission denied - you might not be the teacher of this course",
        );
      }
    },
  });
};

// Update Lesson
export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      lessonData,
    }: {
      lessonId: number;
      courseId: string;
      lessonData: LessonCreateRequestDto;
    }): Promise<LessonResponseDto> => {
      const { data } = await api.patch<ApiResponse<LessonResponseDto>>(
        `/lessons/${lessonId}`,
        lessonData,
      );
      return data.data;
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({
        queryKey: courseContentQueryKeys.lessons(courseId),
      });
    },
    onError: (error: any) => {
      console.error("Error updating lesson:", error);
    },
  });
};

// Delete Lesson
export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
    }: {
      lessonId: number;
      courseId: string;
    }): Promise<void> => {
      await api.delete(`/lessons/${lessonId}`);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({
        queryKey: courseContentQueryKeys.lessons(courseId),
      });
    },
    onError: (error: any) => {
      console.error("Error deleting lesson:", error);
    },
  });
};

// ============ EXERCISE HOOKS ============

// Get Course Exercises
export const useGetCourseExercises = (courseId: string) => {
  return useQuery({
    queryKey: courseContentQueryKeys.exercises(courseId),
    queryFn: async (): Promise<ExerciseResponseDto[]> => {
      const { data } = await api.get<ApiResponse<ExerciseResponseDto[]>>(
        `/${courseId}/exercises`,
      );
      return data.data;
    },
    enabled: !!courseId,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Create Exercise
export const useCreateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      exerciseData,
    }: {
      courseId: string;
      exerciseData: ExerciseCreateRequestDto;
    }): Promise<ExerciseResponseDto> => {
      const { data } = await api.post<ApiResponse<ExerciseResponseDto>>(
        `/${courseId}/exercises`,
        exerciseData,
      );
      return data.data;
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({
        queryKey: courseContentQueryKeys.exercises(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: ["course", courseId],
      });
    },
    onError: (error: any) => {
      console.error("Error creating exercise:", error);
    },
  });
};

// Update Exercise
export const useUpdateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exerciseId,
      exerciseData,
    }: {
      exerciseId: number;
      courseId: string;
      exerciseData: ExerciseCreateRequestDto;
    }): Promise<ExerciseResponseDto> => {
      const { data } = await api.patch<ApiResponse<ExerciseResponseDto>>(
        `/exercises/${exerciseId}`,
        exerciseData,
      );
      return data.data;
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({
        queryKey: courseContentQueryKeys.exercises(courseId),
      });
    },
    onError: (error: any) => {
      console.error("Error updating exercise:", error);
    },
  });
};

// Delete Exercise
export const useDeleteExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exerciseId,
    }: {
      exerciseId: number;
      courseId: string;
    }): Promise<void> => {
      await api.delete(`/exercises/${exerciseId}`);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({
        queryKey: courseContentQueryKeys.exercises(courseId),
      });
    },
    onError: (error: any) => {
      console.error("Error deleting exercise:", error);
    },
  });
};

// ============ RESOURCE HOOKS ============

// Get Course Resources
export const useGetCourseResources = (courseId: string) => {
  return useQuery({
    queryKey: courseContentQueryKeys.resources(courseId),
    queryFn: async (): Promise<ResourceResponseDto[]> => {
      const { data } = await api.get<ApiResponse<ResourceResponseDto[]>>(
        `/${courseId}/resources`,
      );
      return data.data;
    },
    enabled: !!courseId,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Create Resource
export const useCreateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      resourceData,
    }: {
      courseId: string;
      resourceData: ResourceCreateRequestDto;
    }): Promise<ResourceResponseDto> => {
      const { data } = await api.post<ApiResponse<ResourceResponseDto>>(
        `/${courseId}/resources`,
        resourceData,
      );
      return data.data;
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({
        queryKey: courseContentQueryKeys.resources(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: ["course", courseId],
      });
    },
    onError: (error: any) => {
      console.error("Error creating resource:", error);
    },
  });
};

// Update Resource
export const useUpdateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceId,
      resourceData,
    }: {
      resourceId: number;
      courseId: string;
      resourceData: ResourceCreateRequestDto;
    }): Promise<ResourceResponseDto> => {
      const { data } = await api.patch<ApiResponse<ResourceResponseDto>>(
        `/resources/${resourceId}`,
        resourceData,
      );
      return data.data;
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({
        queryKey: courseContentQueryKeys.resources(courseId),
      });
    },
    onError: (error: any) => {
      console.error("Error updating resource:", error);
    },
  });
};

// Delete Resource
export const useDeleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceId,
    }: {
      resourceId: number;
      courseId: string;
    }): Promise<void> => {
      await api.delete(`/resources/${resourceId}`);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({
        queryKey: courseContentQueryKeys.resources(courseId),
      });
    },
    onError: (error: any) => {
      console.error("Error deleting resource:", error);
    },
  });
};

// ============ BULK OPERATIONS (Optional) ============

// Get All Course Content
export const useGetCourseContent = (courseId: string) => {
  const lessonsQuery = useGetCourseLessons(courseId);
  const exercisesQuery = useGetCourseExercises(courseId);
  const resourcesQuery = useGetCourseResources(courseId);

  return {
    lessons: lessonsQuery.data || [],
    exercises: exercisesQuery.data || [],
    resources: resourcesQuery.data || [],
    isLoading:
      lessonsQuery.isLoading ||
      exercisesQuery.isLoading ||
      resourcesQuery.isLoading,
    error: lessonsQuery.error || exercisesQuery.error || resourcesQuery.error,
    refetch: () => {
      lessonsQuery.refetch();
      exercisesQuery.refetch();
      resourcesQuery.refetch();
    },
  };
};

// ============ OPTIMISTIC UPDATE HOOKS (Advanced) ============

// Optimistic Update for Lesson Order
export const useUpdateLessonOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessons,
    }: {
      courseId: string;
      lessons: { lessonId: number; orderIndex: number }[];
    }) => {
      // This would require a batch update endpoint on your backend
      const promises = lessons.map((lesson) =>
        api.patch(`/lessons/${lesson.lessonId}`, {
          orderIndex: lesson.orderIndex,
        }),
      );
      await Promise.all(promises);
    },
    onMutate: async ({ courseId, lessons }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: courseContentQueryKeys.lessons(courseId),
      });

      // Snapshot the previous value
      const previousLessons = queryClient.getQueryData<LessonResponseDto[]>(
        courseContentQueryKeys.lessons(courseId),
      );

      // Optimistically update to the new value
      if (previousLessons) {
        const updatedLessons = [...previousLessons].sort((a, b) => {
          const aOrder =
            lessons.find((l) => l.lessonId === a.lessonId)?.orderIndex ??
            a.orderIndex;
          const bOrder =
            lessons.find((l) => l.lessonId === b.lessonId)?.orderIndex ??
            b.orderIndex;
          return aOrder - bOrder;
        });

        queryClient.setQueryData(
          courseContentQueryKeys.lessons(courseId),
          updatedLessons,
        );
      }

      return { previousLessons };
    },
    onError: (_err, { courseId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLessons) {
        queryClient.setQueryData(
          courseContentQueryKeys.lessons(courseId),
          context.previousLessons,
        );
      }
    },
    onSettled: (_, __, { courseId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: courseContentQueryKeys.lessons(courseId),
      });
    },
  });
};
