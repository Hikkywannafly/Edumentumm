import { apiClient } from "@/lib/api/client";
import axios from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: quizId } = await params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 },
      );
    }

    console.log(
      "Fetching quiz from:",
      `${apiClient.defaults.baseURL}/student/quizzes/${quizId}`,
    );

    const response = await apiClient.get(`/student/quizzes/${quizId}`, {
      headers: {
        Authorization: authHeader,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Fetch quiz error:", error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorData = error.response?.data || { message: error.message };

      return NextResponse.json(
        {
          error: "Failed to fetch quiz",
          details: errorData,
        },
        { status },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
