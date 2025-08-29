import { apiClient } from "@/lib/api/client";
import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateQuizSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  questions: z.array(z.any()).optional(),
  metadata: z
    .object({
      tags: z.array(z.string()).optional(),
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
    try {
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

      console.log("✅ Quiz created:", quiz);
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

    const updatePayload: any = {};

    if (validated.data.title) {
      updatePayload.title = validated.data.title;
    }

    if (validated.data.description !== undefined) {
      updatePayload.description = validated.data.description;
    }

    if (validated.data.questions) {
      const backendQuestions = validated.data.questions.map((q: any) => ({
        id: q.id,
        text: q.question, // Frontend uses 'question', backend uses 'text'
        type: q.type,
        points: q.points || 1,
        explanation: q.explanation,
        options: q.answers.map((answer: any) => ({
          id: answer.id,
          text: answer.text,
        })),
        correctAnswer: q.answers.find((answer: any) => answer.isCorrect)?.id,
      }));

      updatePayload.quizData = {
        questions: backendQuestions,
        instructions:
          "Please read each question carefully and select the best answer.",
      };
    }

    if (validated.data.metadata) {
      // Update other metadata fields as needed
      if (validated.data.metadata.tags) {
        // Convert frontend tags (strings) to backend tags (objects)
        updatePayload.tags = validated.data.metadata.tags.map(
          (tag: string) => ({
            name: tag,
            description: `Auto-generated tag for ${tag}`,
            icon: "",
            color: "",
          }),
        );
      }
    }

    try {
      // Update quiz in real backend
      const response = await apiClient.put(
        `/student/quizzes/${quizId}`,
        updatePayload,
        {
          headers: authHeader
            ? {
                Authorization: authHeader,
              }
            : {},
        },
      );

      const updatedQuiz = response.data;

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
