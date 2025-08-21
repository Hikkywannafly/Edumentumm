import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const GenerateTitleDescriptionRequestSchema = z.object({
  content: z.string(),
  questions: z.array(
    z.object({
      question: z.string(),
      type: z.string().optional(),
    }),
  ),
  isExtractMode: z.boolean(),
  targetLanguage: z.string().default("auto"),
  filename: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  modelName: z.string().default("google/gemini-2.0-flash-exp:free"),
});

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

function detectLanguage(content: string): boolean {
  const vietnameseChars =
    /[ăâêôơưđàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return vietnameseChars.test(content);
}

function createFallbackTitle(
  filename: string | undefined,
  isVietnamese: boolean,
): string {
  if (filename) {
    const cleanFilename = filename.replace(/\.[^/.]+$/, "");
    return isVietnamese
      ? `Bài kiểm tra: ${cleanFilename}`
      : `${cleanFilename} Quiz`;
  }
  return isVietnamese ? "Bài kiểm tra được tạo" : "Generated Quiz";
}

function createFallbackDescription(
  questionCount: number,
  isVietnamese: boolean,
): string {
  return isVietnamese
    ? `Bài kiểm tra với ${questionCount} câu hỏi về các chủ đề khác nhau`
    : `Quiz with ${questionCount} questions covering various topics`;
}

function parseAIResponse(
  aiResponse: string,
): { title: string; description: string } | null {
  try {
    const parsed = JSON.parse(aiResponse);

    // Handle both array and object responses
    let result = parsed;
    if (Array.isArray(parsed) && parsed.length > 0) {
      result = parsed[0];
      console.log("AI returned array, using first item:", result);
    }

    if (result.title && result.description) {
      return {
        title: result.title,
        description: result.description,
      };
    }

    console.error("Missing fields in parsed response:", parsed);
    console.error("Processed result:", result);
    return null;
  } catch (parseError) {
    console.error("JSON parse error:", parseError);
    console.error("Raw AI response:", aiResponse);
    return null;
  }
}

function buildContextInfo(
  questions: any[],
  isExtractMode: boolean,
  filename?: string,
  category?: string,
  tags?: string[],
): string {
  const contextParts = [
    `Questions: ${questions.length}`,
    `Source: ${isExtractMode ? "Extracted from document" : "AI Generated"}`,
    filename ? `File: ${filename.replace(/\.[^/.]+$/, "")}` : "",
    category ? `Topic: ${category}` : "",
    tags && tags.length ? `Tags: ${tags.join(", ")}` : "",
  ];

  return contextParts.filter(Boolean).join(" | ");
}

function createSystemPrompt(): string {
  return `You are an expert quiz title and description generator. Your task is to analyze quiz content and create engaging, specific titles that reflect the actual subject matter.

RULES:
1. NEVER use generic phrases like "AI Generated Quiz", "Quiz from [filename]", or "Test Quiz"
2. Focus on the ACTUAL SUBJECT MATTER and topics covered
3. Create titles that students would find appealing and descriptive
4. DETECT THE LANGUAGE OF THE CONTENT AND RESPOND IN THE SAME LANGUAGE
5. Make titles specific to the content, not the source file
6. Keep titles concise but descriptive (30-60 characters)
7. Make descriptions informative and engaging (80-150 characters)

LANGUAGE DETECTION RULES:
- If content contains Vietnamese characters (ă, â, ê, ô, ơ, ư, đ), respond in Vietnamese
- If content is in English, respond in English
- If content is mixed, use the dominant language
- NEVER default to English if content is in another language

EXAMPLES OF GOOD TITLES:
- Vietnamese content → "Toán học lớp 12: Hàm số và đạo hàm"
- English content → "English Grammar: Tenses and Conditionals"
- Vietnamese content → "Lịch sử Việt Nam: Thời kỳ kháng chiến"

Always return valid JSON with title and description fields.`;
}

function createUserPrompt(
  contentPreview: string,
  questionSamples: string,
  contextInfo: string,
): string {
  return `Analyze this quiz content and create a specific, engaging title and description:

CONTENT PREVIEW:
${contentPreview}

SAMPLE QUESTIONS:
${questionSamples}

CONTEXT: ${contextInfo}

CRITICAL REQUIREMENTS:
1. DETECT THE LANGUAGE OF THE CONTENT FIRST
2. If content contains Vietnamese characters (ă, â, ê, ô, ơ, ư, đ), respond in Vietnamese
3. If content is in English, respond in English
4. Create a title that reflects the ACTUAL SUBJECT MATTER, not the filename
5. Make it specific to the topics covered in the questions
6. Avoid generic phrases like "AI Quiz", "Test Quiz", or "Quiz from file"
7. Focus on what students will actually learn or be tested on

Return JSON format:
{
  "title": "Specific subject-based title in the same language as content",
  "description": "Detailed description of what the quiz covers in the same language as content"
}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = GenerateTitleDescriptionRequestSchema.safeParse(body);

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

    const { content, questions, isExtractMode, filename, category, tags } =
      validated.data;

    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "OpenRouter API key not configured" },
        { status: 500 },
      );
    }

    // Prepare data for AI
    const contentPreview = content.slice(0, 1500);
    const questionSamples = questions
      .slice(0, 5)
      .map((q, i) => `${i + 1}. ${q.question}`)
      .join("\n");
    const contextInfo = buildContextInfo(
      questions,
      isExtractMode,
      filename,
      category,
      tags,
    );

    const systemPrompt = createSystemPrompt();
    const userPrompt = createUserPrompt(
      contentPreview,
      questionSamples,
      contextInfo,
    );

    const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://edumentum.vercel.app",
        "X-Title": "Edumentum Quiz Title Generator",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`,
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No content returned from AI");
    }

    console.log("AI Response:", aiResponse);

    // Parse AI response
    const parsedResult = parseAIResponse(aiResponse);
    if (parsedResult) {
      console.log("Successfully parsed AI response:", parsedResult);
      return NextResponse.json({
        success: true,
        title: parsedResult.title,
        description: parsedResult.description,
      });
    }

    const isVietnamese = detectLanguage(contentPreview);
    const fallbackTitle = createFallbackTitle(filename, isVietnamese);
    const fallbackDescription = createFallbackDescription(
      questions.length,
      isVietnamese,
    );

    console.log("Using fallback values:", {
      fallbackTitle,
      fallbackDescription,
    });

    return NextResponse.json({
      success: true,
      title: fallbackTitle,
      description: fallbackDescription,
    });
  } catch (error) {
    console.error("Generate title/description API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
