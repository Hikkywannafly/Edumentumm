import type { AutoSaveQuizPayload, BackendQuizEntity } from "@/types/quiz";
import { type NextRequest, NextResponse } from "next/server";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
export async function POST(request: NextRequest) {
  try {
    const payload: AutoSaveQuizPayload = await request.json();

    if (
      !payload.title ||
      !payload.userId ||
      !payload.quizData?.questions?.length
    ) {
      return NextResponse.json(
        { error: "Missing required fields: title, userId, or questions" },
        { status: 400 },
      );
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 },
      );
    }

    const backendPayload = {
      title: payload.title,
      description: payload.description || "",
      // user_id: payload.userId,
      categoryId: payload.categoryId || 1,
      visibility: payload.visibility,
      language: payload.language,
      questionType: payload.questionType,
      numberOfQuestions: payload.numberOfQuestions,
      mode: payload.mode,
      difficulty: payload.difficulty,
      task: payload.task,
      parsingMode: payload.parsingMode,
      sourceType: payload.sourceType,
      isAiGenerated: payload.isAiGenerated,
      aiModel: payload.aiModel,
      generationMode: payload.generationMode,
      fileProcessingMode: payload.fileProcessingMode,
      quizData: {
        questions: payload.quizData.questions,
        settings: payload.quizData.settings || {},
        metadata: payload.quizData.metadata || {},
      },
      tags: payload.tags || [],
      estimatedTime: payload.estimatedTime || 10,
      passingScore: payload.passingScore || 70,
    };

    // Call backend API
    const response = await fetch(`${API_BASE_URL}/student/quizzes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.headers.get("authorization")?.replace("Bearer ", "")}`,
      },
      body: JSON.stringify(backendPayload),
    });
    console.log(
      "Response:",

      backendPayload,
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend API error:", errorData);
      return NextResponse.json(
        { error: "Failed to save quiz to database", details: errorData },
        { status: response.status },
      );
    }

    const savedQuiz: BackendQuizEntity = await response.json();

    return NextResponse.json({
      success: true,
      quiz: savedQuiz,
      message: "Quiz auto-saved successfully",
    });
  } catch (error) {
    console.error("Auto-save error:", error);
    return NextResponse.json(
      {
        error: "Internal server error during auto-save",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { quizId, ...payload }: AutoSaveQuizPayload & { quizId: number } =
      await request.json();

    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required for update" },
        { status: 400 },
      );
    }

    // Transform and update quiz
    const backendPayload = {
      title: payload.title,
      description: payload.description || "",
      category_id: 1,
      visibility: payload.visibility,
      language: payload.language,
      question_type: payload.questionType,
      number_of_questions: payload.numberOfQuestions,
      mode: payload.mode,
      difficulty: payload.difficulty,
      task: payload.task,
      parsing_mode: payload.parsingMode,
      source_type: payload.sourceType,
      source_content: payload.sourceContent || "",
      is_ai_generated: payload.isAiGenerated,
      ai_model: payload.aiModel,
      generation_mode: payload.generationMode,
      file_processing_mode: payload.fileProcessingMode,
      quiz_data: {
        questions: payload.quizData.questions,
        settings: payload.quizData.settings || {},
        metadata: payload.quizData.metadata || {},
      },
      tags: payload.tags || [],
      estimated_time: payload.estimatedTime || 10,
      passing_score: payload.passingScore || 70,
    };

    const response = await fetch(`${API_BASE_URL}/student/quizzes/${quizId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.headers.get("authorization")?.replace("Bearer ", "")}`,
      },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Failed to update quiz", details: errorData },
        { status: response.status },
      );
    }

    const updatedQuiz: BackendQuizEntity = await response.json();

    return NextResponse.json({
      success: true,
      quiz: updatedQuiz,
      message: "Quiz updated successfully",
    });
  } catch (error) {
    console.error("Quiz update error:", error);
    return NextResponse.json(
      {
        error: "Internal server error during quiz update",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
