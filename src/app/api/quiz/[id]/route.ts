import { apiClient } from "@/lib/api/client";
import { getAuthToken, handleApiError } from "@/lib/api/helper";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateQuizSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  questions: z.array(z.any()).optional(),
  metadata: z
    .object({
      tags: z.array(z.string()).optional(),
      estimated_time: z.number().optional(),
    })
    .optional(),
  keywords: z.array(z.string()).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC", "UNLISTED", "PREMIUM"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  isPremium: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  estimatedTime: z.number().optional(),
  passingScore: z.number().optional(),
  maxAttempts: z.number().optional(),
});

function validateQuizId(id: string): number | null {
  const quizId = Number.parseInt(id);
  return Number.isNaN(quizId) ? null : quizId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const quizId = validateQuizId(id);

    if (!quizId) {
      return NextResponse.json(
        { success: false, message: "Invalid quiz ID" },
        { status: 400 },
      );
    }

    const authToken = getAuthToken(request);
    const headers = authToken ? { Authorization: authToken } : {};

    if (!authToken) {
      console.warn("No authentication token available for backend request");
    }

    const response = await apiClient.get(`/student/quizzes/${quizId}`, {
      headers,
    });

    return NextResponse.json({
      success: true,
      message: "Quiz retrieved successfully",
      data: response.data.data,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const quizId = validateQuizId(id);

    if (!quizId) {
      return NextResponse.json(
        { success: false, message: "Invalid quiz ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validated = UpdateQuizSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid update data",
          details: validated.error.issues,
        },
        { status: 400 },
      );
    }

    const authToken = getAuthToken(request);
    const headers = authToken ? { Authorization: authToken } : {};

    // Build update payload
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
        text: q.question,
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

    // Transform tags from frontend to backend format
    if (validated.data.metadata?.tags) {
      updatePayload.tags = validated.data.metadata.tags.map((tag: string) => ({
        name: tag,
        description: `Auto-generated tag for ${tag}`,
        icon: "",
        color: "",
      }));
    }

    // Handle keywords if provided
    if (validated.data.keywords) {
      updatePayload.keywords = validated.data.keywords;
    }

    // Handle visibility and status
    if (validated.data.visibility !== undefined) {
      updatePayload.visibility = validated.data.visibility;
    }

    if (validated.data.status !== undefined) {
      updatePayload.status = validated.data.status;
    }

    if (validated.data.isPremium !== undefined) {
      updatePayload.isPremium = validated.data.isPremium;
    }

    if (validated.data.isFeatured !== undefined) {
      updatePayload.isFeatured = validated.data.isFeatured;
    }

    if (validated.data.isTrending !== undefined) {
      updatePayload.isTrending = validated.data.isTrending;
    }

    if (validated.data.estimatedTime !== undefined) {
      updatePayload.estimatedTime = validated.data.estimatedTime;
    }

    if (validated.data.passingScore !== undefined) {
      updatePayload.passingScore = validated.data.passingScore;
    }

    if (validated.data.maxAttempts !== undefined) {
      updatePayload.maxAttempts = validated.data.maxAttempts;
    }

    const response = await apiClient.put(
      `/student/quizzes/${quizId}`,
      updatePayload,
      { headers },
    );

    return NextResponse.json({
      success: true,
      message: "Quiz updated successfully",
      data: response.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const quizId = validateQuizId(id);

    if (!quizId) {
      return NextResponse.json(
        { success: false, message: "Invalid quiz ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validated = UpdateQuizSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid update data",
          details: validated.error.issues,
        },
        { status: 400 },
      );
    }

    const authToken = getAuthToken(request);
    const headers = authToken ? { Authorization: authToken } : {};

    // Build update payload - only include fields that are provided
    const updatePayload: any = {};

    if (validated.data.title !== undefined) {
      updatePayload.title = validated.data.title;
    }

    if (validated.data.description !== undefined) {
      updatePayload.description = validated.data.description;
    }

    if (validated.data.questions !== undefined) {
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

    // Transform tags from frontend to backend format
    if (validated.data.metadata?.tags !== undefined) {
      updatePayload.tags = validated.data.metadata.tags.map((tag: string) => ({
        name: tag,
        description: `Auto-generated tag for ${tag}`,
        icon: "",
        color: "",
      }));
    }

    // Handle keywords if provided
    if (validated.data.keywords !== undefined) {
      updatePayload.keywords = validated.data.keywords;
    }

    // Handle visibility and status
    if (validated.data.visibility !== undefined) {
      updatePayload.visibility = validated.data.visibility;
    }

    if (validated.data.status !== undefined) {
      updatePayload.status = validated.data.status;
    }

    if (validated.data.isPremium !== undefined) {
      updatePayload.isPremium = validated.data.isPremium;
    }

    if (validated.data.isFeatured !== undefined) {
      updatePayload.isFeatured = validated.data.isFeatured;
    }

    if (validated.data.isTrending !== undefined) {
      updatePayload.isTrending = validated.data.isTrending;
    }

    if (validated.data.estimatedTime !== undefined) {
      updatePayload.estimatedTime = validated.data.estimatedTime;
    }

    if (validated.data.passingScore !== undefined) {
      updatePayload.passingScore = validated.data.passingScore;
    }

    if (validated.data.maxAttempts !== undefined) {
      updatePayload.maxAttempts = validated.data.maxAttempts;
    }

    // Handle metadata fields
    if (validated.data.metadata?.estimated_time !== undefined) {
      updatePayload.estimatedTime = validated.data.metadata.estimated_time;
    }

    console.log("PATCH Quiz update payload:", updatePayload);

    const response = await apiClient.patch(
      `/student/quizzes/${quizId}`,
      updatePayload,
      { headers },
    );

    return NextResponse.json({
      success: true,
      message: "Quiz updated successfully",
      data: response.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const quizId = validateQuizId(id);

    if (!quizId) {
      return NextResponse.json(
        { success: false, message: "Invalid quiz ID" },
        { status: 400 },
      );
    }

    const authToken = getAuthToken(request);
    const headers = authToken ? { Authorization: authToken } : {};

    await apiClient.delete(`/student/quizzes/${quizId}`, { headers });

    return NextResponse.json({
      success: true,
      message: "Quiz deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
