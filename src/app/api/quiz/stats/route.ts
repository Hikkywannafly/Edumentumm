import { apiClient } from "@/lib/api/client";
import { getAuthToken, handleApiError } from "@/lib/api/helper";
import { type NextRequest, NextResponse } from "next/server";

// Define the new stats data structure based on the API response
interface StudentQuizStats {
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
  averageDuration: number;
  completedQuizzes: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
  accuracyRate: number;
}

// GET endpoint for fetching quiz statistics
export async function GET(request: NextRequest) {
  try {
    // Get authentication token
    const authToken = getAuthToken(request);

    // Only proceed if we have an auth token
    if (!authToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 },
      );
    }

    const headers = {
      Authorization: authToken,
    };

    try {
      // Call the correct backend API for stats
      const response = await apiClient.get<StudentQuizStats>(
        "/student/quiz-stats/my-stats",
        { headers },
      );

      // Transform the backend response to match frontend expectations
      const backendData = response.data;

      const transformedData = {
        totalQuizzes:
          backendData.totalQuizzes !== undefined ? backendData.totalQuizzes : 0,
        publishedQuizzes:
          backendData.completedQuizzes !== undefined
            ? backendData.completedQuizzes
            : 0,
        draftQuizzes:
          (backendData.totalQuizzes !== undefined
            ? backendData.totalQuizzes
            : 0) -
          (backendData.completedQuizzes !== undefined
            ? backendData.completedQuizzes
            : 0),
        totalAttempts:
          backendData.totalAttempts !== undefined
            ? backendData.totalAttempts
            : 0,
        averageScore:
          backendData.averageScore !== undefined
            ? backendData.averageScore
            : null,
        averageDuration:
          backendData.averageDuration !== undefined
            ? backendData.averageDuration
            : null,
        accuracyRate:
          backendData.accuracyRate !== undefined
            ? backendData.accuracyRate
            : null,
      };

      // Validate that we have meaningful data
      if (
        transformedData.totalQuizzes === 0 &&
        transformedData.totalAttempts === 0
      ) {
        // If we have no meaningful data, we might want to use the fallback
        throw new Error("No meaningful data returned from backend");
      }

      return NextResponse.json({
        success: true,
        message: "Quiz statistics retrieved successfully",
        data: transformedData,
        timestamp: new Date().toISOString(),
      });
    } catch (backendError) {
      console.error("Backend stats endpoint error:", backendError);
      // If backend stats endpoint doesn't exist, return a fallback response
      console.warn("Backend stats endpoint not available, using fallback");

      // Fetch quizzes to calculate stats
      const quizResponse = await apiClient.get(
        "/student/quizzes/page?size=1000",
        { headers },
      );

      if (quizResponse.data.success) {
        const quizzes = quizResponse.data.data.content;

        const stats = {
          totalQuizzes: quizzes.length,
          publishedQuizzes: quizzes.filter((q: any) => q.status === "PUBLISHED")
            .length,
          draftQuizzes: quizzes.filter((q: any) => q.status === "DRAFT").length,
          totalAttempts: quizzes.reduce(
            (sum: number, q: any) =>
              sum + (q.attemptCount || q.totalAttempts || 0),
            0,
          ),
        };

        return NextResponse.json({
          success: true,
          message: "Quiz statistics calculated from quiz list",
          data: stats,
        });
      }

      throw new Error("Failed to fetch quizzes for stats calculation");
    }
  } catch (error) {
    return handleApiError(error);
  }
}
