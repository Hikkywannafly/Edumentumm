import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ExtractFlashcardsRequestSchema = z.object({
  title: z.string(),
  description: z.string(),
  apiKey: z.string(),
  fileContent: z.string().optional(),
  modelName: z.string().default("openai/gpt-oss-20b:free"),
  availableCategories: z.string().optional(),
  settings: z
    .object({
      language: z.string().optional(),
      numberOfCards: z.string().optional(),
      difficulty: z.string().optional(),
      generationMode: z.enum(["GENERATE", "EXTRACT"]).optional(),
      fileProcessing: z.string().optional(),
    })
    .optional(),
  file: z
    .object({
      fileName: z.string(),
      mimeType: z.string(),
      data: z.string(),
      size: z.number(),
      type: z.string(),
    })
    .optional(),
});

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ExtractFlashcardsRequestSchema.safeParse(body);

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
      title,
      description,
      apiKey,
      fileContent = "",
      modelName,
      availableCategories = "",
      settings = {},
    } = validated.data;

    // Parse number of cards from settings
    const numberOfCardsRange = settings.numberOfCards || "5-10";
    const numberOfCards =
      Number.parseInt(numberOfCardsRange.split("-")[1]) || 10;

    // Build AI prompt with category selection
    const categoryInstructions = availableCategories
      ? `\n\nCATEGORY SELECTION:\n${availableCategories}\n\nIMPORTANT: You MUST select exactly ONE category from the list above that best matches the flashcard content. Include it in the response as "selectedCategory": "Category Name".`
      : "";

    const prompt = `
You are an expert flashcard extractor. Your task is to EXTRACT and convert existing questions/information from the provided content into well-formatted flashcards.

REQUIREMENTS:
- Title: ${title}
- Description: ${description}
- Language: ${settings.language || "AUTO"}
- Target Number of Cards: ${numberOfCards}
- Difficulty: ${settings.difficulty || "EASY"}${categoryInstructions}

Content to extract flashcards from:
${fileContent.slice(0, 8000)}

CRITICAL RULES FOR EXTRACTION:
1. EXTRACT existing information, don't generate new content
2. Look for questions, definitions, key concepts, and important facts
3. Convert statements into question-answer format
4. Create multiple choice options when possible
5. Extract as many relevant flashcards as found (up to ${numberOfCards})
6. Preserve the original meaning and context
7. If explicit questions exist, extract them directly
8. For definitions/concepts, create "What is..." or "Define..." questions
9. Response MUST be a valid JSON object

EXTRACTION PRIORITIES:
1. Direct questions and their answers
2. Key definitions and terminology
3. Important facts and figures
4. Cause-and-effect relationships
5. Step-by-step procedures
6. Examples and applications

FORMAT:
{
  "selectedCategory": "${availableCategories ? "[Choose from available categories above]" : "General Knowledge"}",
  "flashcards": [
    {
      "id": "fc1",
      "question": "Extracted or converted question?",
      "difficulty": "${settings.difficulty || "EASY"}",
      "explanation": "Clear explanation based on the source material",
      "tags": ["source-topic1", "concept-tag2", "subject-tag3"],
      "choices": [
        "Option A (incorrect)",
        "Option B (correct)",
        "Option C (incorrect)",
        "Option D (incorrect)"
      ],
      "correctAnswer": 1,
      "sourceContext": "Brief context from where this was extracted"
    }
  ]
}

EXTRACTION GUIDELINES:
- Maintain accuracy to source material
- Create clear, unambiguous questions
- Ensure answers are factually correct
- Include context when needed for clarity
- Tag with relevant topics from the source
- Provide educational explanations

RETURN ONLY THE JSON OBJECT ABOVE.`.trim();

    // Call OpenRouter API
    const response = await axios.post(
      `${OPENROUTER_API_BASE}/chat/completions`,
      {
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2, // Lower temperature for extraction to maintain accuracy
        max_tokens: 4000,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://edumentum.vercel.app",
          "X-Title": "Edumentum Flashcard Extractor",
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
    if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
      throw new Error("Invalid AI response format");
    }

    return NextResponse.json({
      success: true,
      flashcards: parsed.flashcards,
      selectedCategory: parsed.selectedCategory || null,
      extractedCount: parsed.flashcards.length,
    });
  } catch (error) {
    console.error("Extract flashcards API error:", error);

    let errorMessage = "Failed to extract flashcards";
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
