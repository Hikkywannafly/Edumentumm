import { apiClient } from "@/lib/api/client";
import { getAuthToken, handleApiError } from "@/lib/api/helper";
import { type NextRequest, NextResponse } from "next/server";

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

    // Call backend API for stats
    const response = await apiClient.get("/student/quizzes/stats", { headers });

    return NextResponse.json({
      success: true,
      message: "Quiz statistics retrieved successfully",
      data: response.data.data,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
