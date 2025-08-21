import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const GenerateFlashcardTitleDescriptionRequestSchema = z.object({
  content: z.string(),
  flashcards: z.array(
    z.object({
      question: z.string(),
      choices: z.array(z.string()).optional(),
      correctAnswer: z.number().optional(),
    }),
  ),
  isExtractMode: z.boolean(),
  targetLanguage: z.string().default("auto"),
  filename: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  modelName: z.string().default("openai/gpt-oss-20b:free"),
  apiKey: z.string(),
});

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated =
      GenerateFlashcardTitleDescriptionRequestSchema.safeParse(body);

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
      content,
      flashcards,
      isExtractMode,
      targetLanguage,
      filename,
      category,
      tags,
      modelName,
      apiKey,
    } = validated.data;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required" },
        { status: 401 },
      );
    }

    // Extract sample questions for context
    const sampleFlashcards = flashcards.slice(0, 3).map((fc) => fc.question);
    const flashcardTopics = tags || [];

    const modeContext = isExtractMode
      ? "extracted from existing content"
      : "generated based on content analysis";

    const prompt = `
You are an expert educational content curator. Generate an engaging and descriptive title and description for a flashcard set that was ${modeContext}.

CONTEXT:
- Source content length: ${content.length} characters
- Number of flashcards: ${flashcards.length}
- Mode: ${isExtractMode ? "Extract" : "Generate"}
- Target language: ${targetLanguage}
${filename ? `- Source file: ${filename}` : ""}
${category ? `- Category: ${category}` : ""}
${flashcardTopics.length > 0 ? `- Topics: ${flashcardTopics.join(", ")}` : ""}

SAMPLE FLASHCARDS:
${sampleFlashcards.map((q, i) => `${i + 1}. ${q}`).join("\n")}

CONTENT PREVIEW:
${content.slice(0, 1000)}...

REQUIREMENTS:
1. Create a concise, engaging title (max 50 characters)
2. Write a clear, informative description (30-80 words)
3. Title should reflect the main topic/subject matter
4. Description should explain what learners will gain from these flashcards
5. Use ${targetLanguage === "auto" ? "the same language as the content" : targetLanguage}
6. Make it appealing for students and educators
7. Include the scope and learning objectives

RESPONSE FORMAT (JSON):
{
  "title": "Engaging flashcard set title",
  "description": "Comprehensive description explaining what learners will gain from this flashcard set, including key topics covered and learning benefits. Should be educational and motivating."
}

TITLE GUIDELINES:
- Be specific about the subject matter
- Use clear, academic language
- Avoid generic phrases like "Study Cards" or "Review Set"
- Include key topics when possible
- Make it searchable and descriptive

DESCRIPTION GUIDELINES:
- Explain the learning value and scope
- Mention key concepts or topics covered
- Highlight the educational benefits
- Use encouraging, academic tone
- Include information about difficulty level if apparent
- Mention the source context if relevant

Generate a title and description that will help students understand the value and scope of this flashcard set.`.trim();

    try {
      const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://edumentum.vercel.app",
          "X-Title": "Edumentum Flashcard Title Generator",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error("No content returned from AI");
      }

      const parsed = JSON.parse(aiResponse);

      if (!parsed.title || !parsed.description) {
        throw new Error("Invalid AI response format");
      }

      return NextResponse.json({
        success: true,
        title: parsed.title,
        description: parsed.description,
      });
    } catch (error) {
      console.error("API call error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Generate flashcard title/description API error:", error);

    let errorMessage = "Failed to generate title and description";
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        errorMessage = "Invalid API key";
      } else if (error.message.includes("429")) {
        errorMessage = "Rate limit exceeded";
      } else if (error.message.includes("quota")) {
        errorMessage = "API quota exhausted";
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
