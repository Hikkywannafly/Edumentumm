import { apiClient } from "@/lib/api/client";
import { generateQuizTitleDescription } from "@/lib/services/ai-llm.service";
import type { Difficulty, QuestionType } from "@/types/quiz";
import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateQuizSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  userId: z.number(),
  categoryId: z.number().optional(),
  visibility: z.string(),
  language: z.string(),
  questionType: z.string(),
  numberOfQuestions: z.number(),
  mode: z.string(),
  difficulty: z.string(),
  task: z.string(),
  parsingMode: z.string(),
  sourceType: z.string(),
  isAiGenerated: z.boolean(),
  generationMode: z.string().optional(),
  fileProcessingMode: z.string().optional(),
  quizData: z.object({
    questions: z.array(
      z.object({
        id: z.string(),
        text: z.string(),
        type: z.string(),
        difficulty: z.string().optional(),
        points: z.number().optional(),
        explanation: z.string().optional(),
        tags: z.array(z.string()).optional(),
        options: z.array(
          z.object({
            id: z.string(),
            text: z.string(),
            isCorrect: z.boolean(),
          }),
        ),
      }),
    ),
    settings: z.object({
      randomizeQuestions: z.boolean().optional(),
      showExplanations: z.boolean().optional(),
      timeLimit: z.number().nullable().optional(),
      passingScore: z.number().optional(),
    }),
  }),
  tags: z.array(z.string()).optional(),
  estimatedTime: z.number().optional(),
  passingScore: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateQuizSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validated.error.issues,
        },
        { status: 400 },
      );
    }

    const data = validated.data;

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 },
      );
    }

    let finalTitle = data.title;
    let finalDescription = data.description || "";

    if (data.isAiGenerated && data.quizData.questions.length > 0) {
      try {
        const questionsContent = data.quizData.questions
          .map((q) => q.text)
          .join("\n");

        const questionsForAI = data.quizData.questions.map((q) => ({
          id: q.id,
          question: q.text,
          type: q.type as QuestionType,
          difficulty: q.difficulty as Difficulty | undefined,
          points: q.points || 1,
          explanation: q.explanation || "",
          tags: q.tags || [],
          answers: q.options.map((option, index) => ({
            id: option.id,
            text: option.text,
            isCorrect: option.isCorrect,
            order_index: index,
            explanation: "",
          })),
          shortAnswerText: "",
        }));

        const titleDescResult = await generateQuizTitleDescription({
          content: questionsContent,
          questions: questionsForAI,
          isExtractMode: data.generationMode === "EXTRACT",
          targetLanguage:
            data.language === "AUTO" ? "auto" : data.language.toLowerCase(),
          filename: undefined, // No filename for create route
          category: undefined, // Can be enhanced to use categoryId if needed
          tags: data.tags || [],
        });

        if (
          titleDescResult.success &&
          titleDescResult.title &&
          titleDescResult.description
        ) {
          finalTitle = titleDescResult.title;
          finalDescription = titleDescResult.description;
          console.log("✅ AI-generated title and description:", {
            title: finalTitle,
            description: finalDescription,
          });
        } else {
          console.warn(
            "⚠️ Failed to generate AI title/description, using provided values",
          );
        }
      } catch (titleError) {
        console.warn(
          "⚠️ Title generation failed, using provided values:",
          titleError,
        );
      }
    }

    const backendPayload = {
      title: finalTitle,
      description: finalDescription,
      user_id: data.userId || 1, // Note: user_id not userId
      categoryId: data.categoryId || 1,
      visibility: data.visibility,
      language: data.language,
      questionType: data.questionType,
      numberOfQuestions: data.numberOfQuestions,
      mode: data.mode,
      difficulty: data.difficulty,
      task: data.task,
      parsingMode: data.parsingMode,
      sourceType: data.sourceType,
      isAiGenerated: data.isAiGenerated,
      aiModel: null, // Add missing field from auto-save
      generationMode: data.generationMode,
      fileProcessingMode: data.fileProcessingMode,
      quizData: {
        questions: data.quizData.questions.map((q) => ({
          id: q.id,
          question: q.text, // Map 'text' to 'question'
          type: q.type,
          difficulty: q.difficulty,
          points: q.points || 1,
          explanation: q.explanation || "",
          tags: q.tags || [],
          answers: q.options.map((option, index) => ({
            id: option.id,
            text: option.text,
            isCorrect: option.isCorrect,
            order_index: index,
          })),
        })),
        settings: data.quizData.settings || {},
        metadata: {
          total_questions: data.quizData.questions.length,
          total_points: data.quizData.questions.reduce(
            (sum, q) => sum + (q.points || 1),
            0,
          ),
          estimated_time: data.estimatedTime || 15,
          tags: data.tags || [],
        },
      },
      tags: data.tags || [],
      estimatedTime: data.estimatedTime || 10,
      passingScore: data.passingScore || 70,
    };

    console.log(
      "Creating quiz with payload:",
      JSON.stringify(backendPayload, null, 2),
    );

    const response = await apiClient.post("/student/quizzes", backendPayload, {
      headers: {
        Authorization: authHeader,
      },
    });

    const savedQuiz = response.data;

    return NextResponse.json({
      success: true,
      id: savedQuiz.id,
      quiz: savedQuiz,
    });
  } catch (error) {
    console.error("❌ Failed to create quiz:", error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorData = error.response?.data || { message: error.message };

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create quiz",
          details: errorData,
        },
        { status },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
