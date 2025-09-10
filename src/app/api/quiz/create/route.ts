import { apiClient } from "@/lib/api/client";
import { generateQuizTitleDescription } from "@/lib/services/ai-llm.service";
import type { Difficulty, QuestionType } from "@/types/quiz";
import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Update schema to match new backend format
const NewBackendQuizSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  estimatedTime: z.number(),
  passingScore: z.number(),
  maxAttempts: z.number().optional(),
  isAiGenerated: z.boolean(),
  aiModel: z.string().optional(),
  sourceType: z.string(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  // canonicalUrl: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED", "PREMIUM"]),
  isPremium: z.boolean().optional(),
  quizData: z.object({
    introduction: z.string().optional(),
    instructions: z.string().optional(),
    questions: z.array(
      z.object({
        id: z.union([z.string(), z.number()]),
        text: z.string(),
        type: z.string(),
        points: z.number(),
        options: z.array(
          z.object({
            id: z.string(),
            text: z.string(),
          }),
        ),
        correctAnswer: z.string(),
        explanation: z.string().optional(),
      }),
    ),
    summary: z.string().optional(),
  }),
  tags: z.array(
    z.object({
      id: z.number().optional(),
      name: z.string(),
      description: z.string().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
    }),
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = NewBackendQuizSchema.safeParse(body);

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
          id: String(q.id),
          question: q.text,
          type: q.type as QuestionType,
          difficulty: "MEDIUM" as Difficulty,
          points: q.points || 1,
          explanation: q.explanation || "",
          tags: [],
          answers: q.options.map((option, index) => ({
            id: option.id,
            text: option.text,
            isCorrect: option.id === q.correctAnswer,
            order_index: index,
            explanation: "",
          })),
          shortAnswerText: "",
        }));

        const titleDescResult = await generateQuizTitleDescription({
          content: questionsContent,
          questions: questionsForAI,
          isExtractMode: false,
          targetLanguage: "auto",
          filename: undefined,
          tags: data.tags.map((t) => t.name),
        });

        if (
          titleDescResult.success &&
          titleDescResult.title &&
          titleDescResult.description
        ) {
          finalTitle = titleDescResult.title;
          finalDescription = titleDescResult.description;
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
      thumbnailUrl: data.thumbnailUrl,
      difficulty: data.difficulty,
      estimatedTime: data.estimatedTime,
      passingScore: data.passingScore,
      maxAttempts: data.maxAttempts || 3,
      isAiGenerated: data.isAiGenerated,
      aiModel: data.aiModel,
      sourceType: data.sourceType,
      metaTitle: data.metaTitle || finalTitle,
      metaDescription: data.metaDescription || finalDescription,
      // canonicalUrl: data.canonicalUrl,
      keywords: data.keywords || [],
      visibility: data.visibility,
      isPremium: data.isPremium || false,
      quizData: data.quizData,
      tags: data.tags,
    };

    const response = await apiClient.post("/student/quizzes", backendPayload, {
      headers: {
        Authorization: authHeader,
      },
    });
    console.log("✅ Quiz created:", response);
    const savedQuiz = response.data.data;

    return NextResponse.json({
      success: true,
      id: savedQuiz.id,
      slug: savedQuiz.slug,
      title: savedQuiz.title || finalTitle,
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
