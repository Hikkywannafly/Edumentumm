import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GenerateFromFileRequestSchema = z.object({
  questionHeader: z.string(),
  questionDescription: z.string(),
  apiKey: z.string(),
  modelName: z.string().default("openai/gpt-oss-20b:free"),
  availableCategories: z.string().optional(),
  settings: z
    .object({
      visibility: z.string().optional(),
      language: z.string().optional(),
      questionType: z.string().optional(),
      numberOfQuestions: z.number().int().min(1).max(10).optional(),
      mode: z.enum(["exact", "max"]).optional(),
      difficulty: z.string().optional(),
      task: z.string().optional(),
      parsingMode: z.string().optional(),
    })
    .optional(),
  file: z.object({
    fileName: z.string(),
    mimeType: z.string(),
    data: z.string(),
    size: z.number(),
    type: z.string(),
  }),
});

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = GenerateFromFileRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request parameters",
          details: validated.error.issues,
        },
        { status: 400 },
      );
    }

    const {
      questionHeader,
      questionDescription,
      apiKey,
      modelName,
      availableCategories = "",
      settings = {},
      file,
    } = validated.data;
    const numberOfQuestions = settings.numberOfQuestions || 5;
    const questionType = settings.questionType || "MIXED";

    // Build category selection instructions
    const categoryInstructions = availableCategories
      ? `\n\nCATEGORY SELECTION:\n${availableCategories}\n\nIMPORTANT: You MUST select exactly ONE category from the list above that best matches the file content and generated questions. Include it in the response as "selectedCategory": "Category Name".`
      : "";

    // Build AI prompt for file generation
    const prompt = `
You are an expert quiz generator. You MUST return EXACTLY ${numberOfQuestions} high-quality questions from the attached file.

REQUIREMENTS:
- Header: ${questionHeader}
- Description: ${questionDescription}
- Language: ${settings.language || "AUTO"}
- Question Type: ${questionType}
- Difficulty: ${settings.difficulty || "EASY"}
- Number of Questions: ${numberOfQuestions}${categoryInstructions}

Attached File: ${file.fileName}

CRITICAL RULES:
1. Return EXACTLY ${numberOfQuestions} questions, no more, no less
2. Each multiple choice question has 4 answers, true/false has 2 answers
3. Only ONE correct answer per question (except free response)
4. Generate creative and relevant tags for each question (3-5 tags per question)
5. Response MUST be a valid JSON object with format {"questions": [...], "selectedCategory": "..."}
6. Analyze the entire file content to create accurate questions

FORMAT:
{
  "selectedCategory": "${availableCategories ? "[Choose from available categories above]" : "General Knowledge"}",
  "questions": [
    {
      "id": "uuid-v4-format-id",
      "question": "Your question?",
      "type": "MULTIPLE_CHOICE",
      "difficulty": "${settings.difficulty || "EASY"}",
      "points": 1,
      "explanation": "Detailed explanation why this answer is correct and others are wrong",
      "tags": ["tag1", "tag2", "tag3"],
      "answers": [
        {"id": "uuid-v4-format-id", "text": "Option A", "isCorrect": false, "order_index": 0},
        {"id": "uuid-v4-format-id", "text": "Option B", "isCorrect": true, "order_index": 1},
        {"id": "uuid-v4-format-id", "text": "Option C", "isCorrect": false, "order_index": 2},
        {"id": "uuid-v4-format-id", "text": "Option D", "isCorrect": false, "order_index": 3}
      ]
    }
  ]
}

RETURN ONLY THE JSON OBJECT ABOVE.`.trim();

    // Prepare message content based on file type
    const messageContent: any[] = [{ type: "text", text: prompt }];

    if (file.type === "image") {
      messageContent.push({
        type: "image_url",
        image_url: { url: `data:${file.mimeType};base64,${file.data}` },
      });
    } else {
      // For documents, include content as text
      messageContent.push({
        type: "text",
        text: `File Content: ${file.data.slice(0, 8000)}`,
      });
    }

    // Call OpenRouter API
    const response = await axios.post(
      `${OPENROUTER_API_BASE}/chat/completions`,
      {
        model: modelName,
        messages: [{ role: "user", content: messageContent }],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://edumentum.vercel.app",
          "X-Title": "Edumentum Quiz Generator",
        },
        timeout: 90000,
      },
    );

    const aiResponse = response.data.choices?.[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No content returned from AI");
    }

    // Parse and validate response
    const parsed = JSON.parse(aiResponse);
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid AI response format");
    }

    // Validate question count based on mode
    const mode = settings.mode || "exact";
    if (mode === "exact" && parsed.questions.length !== numberOfQuestions) {
      console.warn(
        `Expected exactly ${numberOfQuestions} questions, got ${parsed.questions.length}`,
      );
    }

    return NextResponse.json({
      success: true,
      questions: parsed.questions,
      selectedCategory: parsed.selectedCategory || null,
    });
  } catch (error) {
    console.error("Generate questions from file API error:", error);

    let errorMessage = "Failed to generate questions from file";
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      if (status === 401) {
        errorMessage = "Invalid API key";
      } else if (status === 429) {
        errorMessage =
          errorData?.error?.code === "insufficient_quota"
            ? "API quota exhausted - please check your billing"
            : "Rate limit exceeded";
      } else if (status === 413) {
        errorMessage = "File too large";
      } else if (status === 400) {
        errorMessage = "Invalid file format or content";
      } else if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
