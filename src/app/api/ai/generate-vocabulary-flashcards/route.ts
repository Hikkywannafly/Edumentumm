import axios from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const GenerateVocabularyFlashcardsRequestSchema = z.object({
  title: z.string(),
  description: z.string(),
  categoryId: z.number().optional(),
  apiKey: z.string(),
  fileContent: z.string().optional(),
  modelName: z.string().default("google/gemini-2.0-flash-exp:free"),
  availableCategories: z.string().optional(),
  settings: z
    .object({
      visibility: z.string().optional(),
      language: z.string().optional(),
      numberOfCards: z.number().int().min(1).max(20).optional(),
      difficulty: z.string().optional(),
      generationMode: z.enum(["GENERATE", "EXTRACT"]).optional(),
      fileProcessing: z.string().optional(),
      parsingMode: z.string().optional(),
      includeCategories: z.boolean().optional(),
    })
    .optional(),
  // Add support for file object
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
    const validated = GenerateVocabularyFlashcardsRequestSchema.safeParse(body);

    if (!validated.success) {
      console.error("❌ Validation failed:", validated.error.issues);
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
      categoryId,
      apiKey,
      fileContent = "",
      // modelName,
      availableCategories = "",
      settings = {},
      file,
    } = validated.data;

    // Parse number of cards from settings
    const numberOfCards = settings.numberOfCards || 10;
    const generationMode = settings.generationMode || "GENERATE";
    const language = settings.language || "AUTO";
    const difficulty = settings.difficulty || "EASY";

    // Prompt for generating vocabulary flashcards
    const prompt = `
    You are an expert vocabulary flashcard generator. You MUST return EXACTLY ${numberOfCards} vocabulary flashcards.

    REQUIREMENTS:
    - Title: ${title}
    - Description: ${description}
    - Language: ${language || "AUTO"}
    - Difficulty: ${difficulty || "EASY"}
    - Number of Cards: ${numberOfCards}

    Content to generate vocabulary flashcards from:
    ${fileContent.slice(0, 8000)}

    CRITICAL RULES:
    1. Use single-word lemmas only.
      - adj+noun → adjective: “coastal city” → “coastal (adj)”
      - noun+noun / X of Y → core noun: “holiday destination” → “destination (n)”
      - phrasal verb → verb headword: “stroll along” → “stroll (v)” (note particle in explanation).
    2. Priority: adjectives > vivid verbs > key nouns. Exclude proper nouns & very basic words.
    3. Format: <word> (<pos>), where pos ∈ {adj., v., n., adv.}.
    4. Each flashcard has:
      - "vocabulary": headword + POS
      - "meaning": short Vietnamese definition (≤20 words)
      - "example": NEW English sentence, 8–16 words
      - "explanation": usage notes + 1–2 collocations/synonyms

    FORMAT:
    {
      "title": "${title}",
      "description": "${description}",
      "selectedCategory": "${availableCategories ? "[Choose from available categories above]" : "Vocabulary"}",
      "flashcards": [
        {
          "vocabulary": "coastal (adj.)",
          "meaning": "thuộc ven biển",
          "example": "Many coastal towns rely heavily on seasonal tourism.",
          "explanation": "Thường dùng trước danh từ: coastal city/area/road; gần nghĩa: seaside."
        }
      ],
      "metadata": {
        "total_cards": ${numberOfCards},
        "difficulty": "${difficulty}",
        "generation_mode": "${generationMode}",
      }
    }

    RETURN ONLY THE JSON OBJECT ABOVE.`.trim();

    // Call OpenRouter API
    const response = await axios.post(
      `${OPENROUTER_API_BASE}/chat/completions`,
      {
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://edumentum.vercel.app",
          "X-Title": "Edumentum Vocabulary Flashcard Generator",
        },
        timeout: 90000,
      },
    );

    const aiResponse = response.data.choices?.[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No content returned from AI");
    }

    // Parse AI response
    let generatedData: any;
    try {
      generatedData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("❌ Failed to parse AI response:", parseError);
      console.error("Raw AI response:", aiResponse);
      throw new Error("Failed to parse AI response");
    }

    // Validate the generated vocabulary flashcards structure
    if (!generatedData.flashcards || !Array.isArray(generatedData.flashcards)) {
      throw new Error("Invalid flashcards structure in AI response");
    }

    // Validate each vocabulary flashcard
    const isValidVocabularyCard = (card: any) => {
      return (
        card &&
        typeof card.vocabulary === "string" &&
        typeof card.meaning === "string" &&
        typeof card.example === "string" &&
        typeof card.explanation === "string"
      );
    };

    const validFlashcards = generatedData.flashcards.filter(
      isValidVocabularyCard,
    );

    if (validFlashcards.length === 0) {
      throw new Error("No valid vocabulary flashcards generated");
    }

    // Ensure we have the requested number of cards (or at least some)
    const finalFlashcards = validFlashcards.slice(0, numberOfCards);

    return NextResponse.json({
      success: true,
      title: generatedData.title || title,
      description: generatedData.description || description,
      categoryId: categoryId,
      flashcardType: "VOCABULARY",
      isPublic: false,
      selectedCategory: generatedData.selectedCategory,
      flashcards: finalFlashcards,
      metadata: {
        total_cards: finalFlashcards.length,
        difficulty: difficulty,
        estimated_study_time: Math.ceil(finalFlashcards.length * 0.8),
        generated_from: file ? "file" : "text",
        generation_mode: generationMode,
        flashcard_type: "VOCABULARY",
      },
    });
  } catch (error) {
    console.error("Generate vocabulary flashcards API error:", error);

    let errorMessage = "Failed to generate vocabulary flashcards";
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
