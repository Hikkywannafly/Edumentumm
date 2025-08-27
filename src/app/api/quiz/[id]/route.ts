import { apiClient } from "@/lib/api/client";
import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateQuizSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  quiz_data: z
    .object({
      questions: z.array(z.any()).optional(),
      settings: z.object({}).optional(),
      metadata: z.object({}).optional(),
    })
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const quizId = Number.parseInt(id);

    if (Number.isNaN(quizId)) {
      return NextResponse.json(
        { success: false, error: "Invalid quiz ID" },
        { status: 400 },
      );
    }
    let authHeader = request.headers.get("authorization");

    if (!authHeader) {
      const cookies = request.headers.get("cookie");
      if (cookies) {
        const match = cookies.match(/accessToken=([^;]+)/);
        if (match) {
          authHeader = `Bearer ${match[1]}`;
        }
      }
    }

    console.log("🔐 Auth header:", authHeader ? "Present" : "Missing");

    try {
      // Fetch quiz from real backend
      const requestHeaders: any = {};

      if (authHeader) {
        requestHeaders.Authorization = authHeader;
      } else {
        console.warn("⚠️ No authentication token available for backend request");
      }

      const response = await apiClient.get(`/student/quizzes/${quizId}`, {
        headers: requestHeaders,
      });

      const quiz = response.data;
      console.log("✅ Quiz fetched successfully:", quizId);
      console.log(
        "🔍 Backend quiz data structure:",
        JSON.stringify(quiz, null, 2),
      );
      console.log("📋 QuizData field:", quiz.quizData);
      console.log(
        "📋 Questions in quizData:",
        quiz.quizData?.questions?.length || 0,
      );

      return NextResponse.json(quiz);
    } catch (apiError) {
      if (axios.isAxiosError(apiError)) {
        console.error("❌ API Error fetching quiz:", {
          status: apiError.response?.status,
          data: apiError.response?.data,
          message: apiError.message,
        });

        return NextResponse.json(
          {
            success: false,
            error:
              apiError.response?.data?.message ||
              apiError.message ||
              "Failed to fetch quiz",
          },
          { status: apiError.response?.status || 500 },
        );
      }
      throw apiError;
    }
  } catch (error) {
    console.error("❌ Failed to fetch quiz:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const quizId = Number.parseInt(id);

    if (Number.isNaN(quizId)) {
      return NextResponse.json(
        { success: false, error: "Invalid quiz ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validated = UpdateQuizSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid update data",
          details: validated.error.issues,
        },
        { status: 400 },
      );
    }

    const authHeader = request.headers.get("authorization");

    try {
      // Update quiz in real backend
      const response = await apiClient.put(
        `/student/quizzes/${quizId}`,
        validated.data,
        {
          headers: authHeader
            ? {
                Authorization: authHeader,
              }
            : {},
        },
      );

      const updatedQuiz = response.data;
      console.log("✅ Quiz updated successfully:", quizId);

      return NextResponse.json({
        success: true,
        quiz: updatedQuiz,
      });
    } catch (apiError) {
      if (axios.isAxiosError(apiError)) {
        console.error("❌ API Error updating quiz:", {
          status: apiError.response?.status,
          data: apiError.response?.data,
          message: apiError.message,
        });

        return NextResponse.json(
          {
            success: false,
            error:
              apiError.response?.data?.message ||
              apiError.message ||
              "Failed to update quiz",
          },
          { status: apiError.response?.status || 500 },
        );
      }
      throw apiError;
    }
  } catch (error) {
    console.error("❌ Failed to update quiz:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const quizId = Number.parseInt(id);

    if (Number.isNaN(quizId)) {
      return NextResponse.json(
        { success: false, error: "Invalid quiz ID" },
        { status: 400 },
      );
    }

    const authHeader = request.headers.get("authorization");

    try {
      await apiClient.delete(`/student/quizzes/${quizId}`, {
        headers: authHeader
          ? {
              Authorization: authHeader,
            }
          : {},
      });
      return NextResponse.json({
        success: true,
        message: "Quiz deleted successfully",
      });
    } catch (apiError) {
      if (axios.isAxiosError(apiError)) {
        console.error("❌ API Error deleting quiz:", {
          status: apiError.response?.status,
          data: apiError.response?.data,
          message: apiError.message,
        });

        return NextResponse.json(
          {
            success: false,
            error:
              apiError.response?.data?.message ||
              apiError.message ||
              "Failed to delete quiz",
          },
          { status: apiError.response?.status || 500 },
        );
      }
      throw apiError;
    }
  } catch (error) {
    console.error("❌ Failed to delete quiz:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
