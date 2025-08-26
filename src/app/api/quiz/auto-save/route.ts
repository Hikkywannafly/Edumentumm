import { apiClient } from "@/lib/api/client";
import type { AutoSaveQuizPayload, BackendQuizEntity } from "@/types/quiz";
import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload: AutoSaveQuizPayload = await request.json();

    if (!payload.title || !payload.quizData?.questions?.length) {
      return NextResponse.json(
        { error: "Missing required fields: title or questions" },
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
      user_id: payload.userId || 1,
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

    console.log("Creating quiz with payload:", payload.tags);

    const response = await apiClient.post("/student/quizzes", backendPayload, {
      headers: {
        Authorization: authHeader,
      },
    });

    const savedQuiz: BackendQuizEntity = response.data;

    return NextResponse.json({
      success: true,
      quiz: savedQuiz,
      message: "Quiz auto-saved successfully",
    });
  } catch (error) {
    console.error("Auto-save error:", error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorData = error.response?.data || { message: error.message };

      return NextResponse.json(
        {
          error: "Failed to save quiz to database",
          details: errorData,
        },
        { status },
      );
    }

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
      category_id: payload.categoryId || 1,
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

    console.log("Updating quiz:", quizId, "with payload:", backendPayload);

    const response = await apiClient.put(
      `/student/quizzes/${quizId}`,
      backendPayload,
      {
        headers: {
          Authorization: authHeader,
        },
      },
    );

    const updatedQuiz: BackendQuizEntity = response.data;

    return NextResponse.json({
      success: true,
      quiz: updatedQuiz,
      message: "Quiz updated successfully",
    });
  } catch (error) {
    console.error("Quiz update error:", error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorData = error.response?.data || { message: error.message };

      return NextResponse.json(
        {
          error: "Failed to update quiz",
          details: errorData,
        },
        { status },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error during quiz update",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
