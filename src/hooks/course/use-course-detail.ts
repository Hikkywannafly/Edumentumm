import type { ApiResponse, PublicCourseDetailDto } from "@/types/course.type";
import { useQuery } from "@tanstack/react-query";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const getCourseDetail = async (
  courseId: string,
  token?: string,
): Promise<PublicCourseDetailDto> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  const result: ApiResponse<PublicCourseDetailDto> = await response.json();
  return result.data;
};

export const useCourseDetail = (courseId: string) => {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => {
      // Get token safely on client side
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      return getCourseDetail(courseId, token || undefined);
    },
    enabled: !!courseId, // Only run when courseId exists
  });
};
