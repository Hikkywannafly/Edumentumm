import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const GenerateFlashcardTitleDescriptionRequestSchema = z.object({
  content: z.string(),
  flashcards: z.array(
    z.object({
      // For questions type
      question: z.string().optional(),
      choices: z.array(z.string()).optional(),
      correctAnswer: z.number().optional(),
      // For vocabulary type
      vocabulary: z.string().optional(),
      meaning: z.string().optional(),
      example: z.string().optional(),
      explanation: z.string().optional(),
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

    // Extract sample flashcards for context based on type
    const sampleFlashcards = flashcards
      .slice(0, 3)
      .map((fc) => {
        // Check if it's vocabulary type
        if (fc.vocabulary && fc.meaning) {
          return `${fc.vocabulary}: ${fc.meaning}`;
        }
        // Default to question type
        return fc.question || "";
      })
      .filter(Boolean);

    const flashcardTopics = tags || [];

    // Determine flashcard type for context
    const isVocabularyType =
      flashcards.length > 0 &&
      flashcards[0].vocabulary &&
      flashcards[0].meaning;
    const flashcardTypeContext = isVocabularyType ? "vocabulary" : "question";

    const prompt = `
You are an expert educational content curator.
Generate a JSON response with an engaging title and description for a ${flashcardTypeContext} flashcard set.

CONTEXT:
- Source length: ${content.length} chars
- Flashcards: ${flashcards.length}
- Type: ${flashcardTypeContext.toUpperCase()}
- Mode: ${isExtractMode ? "Extract" : "Generate"}
- Language: ${targetLanguage}
${filename ? `- File: ${filename}` : ""}
${category ? `- Category: ${category}` : ""}
${flashcardTopics.length > 0 ? `- Topics: ${flashcardTopics.join(", ")}` : ""}

SAMPLE FLASHCARDS (examples only):
${sampleFlashcards
  .slice(0, 3)
  .map((q, i) => `${i + 1}. ${q}`)
  .join("\n")}

CONTENT PREVIEW:
${content.slice(0, 500)}...

RULES:
- Return JSON: { "title": "...", "description": "..." }
- Title: ≤ 50 chars, specific to subject & ${flashcardTypeContext}
- Style depends on flashcard type:
  - If type = "vocabulary":
      * Title must start with "Từ vựng về ..."
      * Title should reflect a broad subject/category (e.g., "Từ vựng về Ẩm thực"), not just one item.
- Description: 20–50 words, highlight scope, learning value
- Use target language (${targetLanguage})
- Style: academic, clear, motivating
${
  isVocabularyType
    ? "- Emphasize language learning, word usage, comprehension"
    : "- Emphasize knowledge testing, retention, concept mastery"
}
`.trim();

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
