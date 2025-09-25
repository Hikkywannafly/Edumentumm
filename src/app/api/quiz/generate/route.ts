import {
  generateQuestions,
  generateQuestionsFromFile,
  generateQuizTitleDescription,
} from "@/lib/services/ai-llm.service";
import { fileToAIService } from "@/lib/services/file-to-ai.service";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GenerateQuizSchema = z.object({
  files: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      parsedContent: z.string().optional(),
      actualFile: z.any().optional(),
    }),
  ),
  settings: z.object({
    generationMode: z.string(),
    fileProcessingMode: z.string(),
    visibility: z.string(),
    language: z.string(),
    questionType: z.string(),
    numberOfQuestions: z.number(),
    mode: z.string(),
    difficulty: z.string(),
    task: z.string(),
    parsingMode: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = GenerateQuizSchema.safeParse(body);

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

    const { files, settings } = validated.data;

    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not configured");
    }

    let result: { success: boolean; questions?: any[]; error?: string };

    const isDirectMode =
      settings.fileProcessingMode === "SEND_DIRECT" && files.length > 0;

    if (isDirectMode && files[0]?.actualFile) {
      const validation = fileToAIService.validateFileForAI(files[0].actualFile);
      if (validation.valid) {
        const fileForAI = await fileToAIService.convertFileToAI(
          files[0].actualFile,
        );
        result = await generateQuestionsFromFile({
          questionHeader: "Generate Quiz Questions",
          questionDescription:
            "Generate new quiz questions from the provided file.",
          apiKey,
          file: fileForAI,
          settings: {
            language: settings.language,
            numberOfQuestions: settings.numberOfQuestions,
            difficulty: settings.difficulty,
            questionType: settings.questionType,
            parsingMode: settings.parsingMode,
          },
        });
      } else {
        throw new Error("File is not suitable for direct AI processing");
      }
    } else {
      // Parse then send mode - use parsed content
      const content = files.map((f) => f.parsedContent || "").join("\n\n");
      if (!content.trim()) {
        throw new Error("No content found in uploaded files");
      }

      result = await generateQuestions({
        questionHeader: "Generate Quiz Questions",
        questionDescription:
          "Generate new quiz questions from the provided content.",
        apiKey,
        fileContent: content,
        settings: {
          language: settings.language,
          numberOfQuestions: settings.numberOfQuestions,
          difficulty: settings.difficulty,
          questionType: settings.questionType,
          parsingMode: settings.parsingMode,
        },
      });
    }

    if (!result.success || !result.questions || result.questions.length === 0) {
      throw new Error(result.error || "No questions could be generated");
    }

    let title = `AI Generated Quiz from ${files[0]?.name || "Files"}`;
    let description = `Generated ${result.questions.length} questions using AI`;

    try {
      const content = isDirectMode
        ? files[0]?.name || "Uploaded content"
        : files.map((f) => f.parsedContent || "").join("\n\n");

      const titleDescResult = await generateQuizTitleDescription({
        content,
        questions: result.questions,
        isExtractMode: settings.generationMode === "EXTRACT",
        targetLanguage:
          settings.language === "AUTO"
            ? "auto"
            : settings.language.toLowerCase(),
        filename: files[0]?.name,
        tags: result.questions
          .flatMap((q: any) => q.tags || [])
          .filter(
            (tag: string, index: number, arr: string[]) =>
              arr.indexOf(tag) === index,
          )
          .slice(0, 5),
      });

      if (
        titleDescResult.success &&
        titleDescResult.title &&
        titleDescResult.description
      ) {
        title = titleDescResult.title;
        description = titleDescResult.description;
        // console.log("✅ AI-generated title and description:", {
        //   title,
        //   description,
        // });
      } else {
        console.warn(
          "⚠️ Failed to generate AI title/description, using fallback",
        );
      }
    } catch (titleError) {
      console.warn("⚠️ Title generation failed, using fallback:", titleError);
    }

    const quiz = {
      title,
      description,
      questions: result.questions,
      metadata: {
        total_questions: result.questions.length,
        total_points: result.questions.reduce(
          (sum: number, q: any) => sum + (q.points || 1),
          0,
        ),
        estimated_time: Math.max(5, Math.ceil(result.questions.length * 1.5)),
        tags: result.questions
          .flatMap((q: any) => q.tags || [])
          .filter(
            (tag: string, index: number, arr: string[]) =>
              arr.indexOf(tag) === index,
          )
          .slice(0, 10),
      },
    };

    console.log(
      "Quiz generated successfully with AI:",
      quiz.questions.length,
      "questions",
    );

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("❌ Failed to generate quiz:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
