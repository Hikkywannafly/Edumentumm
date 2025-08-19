import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GenerateFlashcardsFromFileRequestSchema = z.object({
  title: z.string(),
  description: z.string(),
  apiKey: z.string(),
  modelName: z.string().default("openai/gpt-oss-20b:free"),
  availableCategories: z.string().optional(),
  settings: z
    .object({
      visibility: z.string().optional(),
      language: z.string().optional(),
      numberOfCards: z.string().optional(),
      difficulty: z.string().optional(),
      generationMode: z.enum(["GENERATE", "EXTRACT"]).optional(),
      fileProcessing: z.string().optional(),
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
    console.log("🚀 Starting flashcard generation from file...");
    const body = await request.json();
    console.log("📝 Request body keys:", Object.keys(body));

    const validated = GenerateFlashcardsFromFileRequestSchema.safeParse(body);

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

    console.log("✅ Validation passed");

    const {
      apiKey,
      modelName,
      availableCategories = "",
      settings = {},
      file,
    } = validated.data;

    // Parse number of cards from settings
    const numberOfCardsRange = settings.numberOfCards || "5-10";
    const numberOfCards =
      Number.parseInt(numberOfCardsRange.split("-")[1]) || 10;
    const generationMode = settings.generationMode || "GENERATE";

    // Process file content
    let fileContent = "";
    try {
      console.log("🔍 Processing file content...");
      console.log("📁 File name:", file.fileName);
      console.log("📋 File type:", file.mimeType);
      console.log("📏 File size:", file.size, "bytes");
      console.log("🔤 Data starts with:", file.data.substring(0, 100));

      // Decode base64 content if it's base64 encoded
      if (file.data.includes("base64,")) {
        const base64Data = file.data.split("base64,")[1];
        fileContent = Buffer.from(base64Data, "base64").toString("utf-8");
        console.log("✅ Decoded base64 content");
        console.log("📝 Content preview:", fileContent.substring(0, 200));
      } else {
        fileContent = file.data;
        console.log("📝 Using direct content:", fileContent.substring(0, 200));
      }

      // Additional cleaning for common text file issues
      fileContent = fileContent
        .replace(/\r\n/g, "\n") // Normalize line endings
        .replace(/\r/g, "\n") // Handle old Mac line endings
        .trim(); // Remove leading/trailing whitespace

      console.log("🧹 Cleaned content length:", fileContent.length);
      console.log("📄 Final content preview:", fileContent.substring(0, 500));
    } catch (error) {
      console.error("❌ Error processing file content:", error);
      fileContent = file.data; // Fallback to original data
    }

    // Build AI prompt with category selection
    const categoryInstructions = availableCategories
      ? `\n\nCATEGORY SELECTION:\n${availableCategories}\n\nIMPORTANT: You MUST select exactly ONE category from the list above that best matches the flashcard content. Include it in the response as "selectedCategory": "Category Name".`
      : "";

    const isExtractMode = generationMode === "EXTRACT";

    const prompt = `
You are an expert flashcard ${isExtractMode ? "extractor" : "generator"}. ${
      isExtractMode
        ? "Your task is to EXTRACT existing questions and information from the provided file content and convert them into well-formatted flashcards."
        : "You MUST create high-quality flashcards for effective learning and memorization from the provided file content."
    }

CRITICAL: You MUST analyze the file content and generate an appropriate TITLE and DESCRIPTION based on the actual content, not use the provided defaults.

REQUIREMENTS:
- Auto-generate Title: Create a descriptive title based on the file content
- Auto-generate Description: Create a helpful description based on the file content
- Language: ${settings.language || "AUTO"}
- Number of Cards: ${numberOfCards}
- Difficulty: ${settings.difficulty || "EASY"}
- Mode: ${generationMode}${categoryInstructions}

File Information:
- Name: ${file.fileName}
- Type: ${file.mimeType}
- Size: ${(file.size / 1024).toFixed(2)} KB

Content from file:
${fileContent}

${
  isExtractMode
    ? `
EXTRACTION RULES:
1. EXTRACT existing information, don't generate new content
2. Look for questions, definitions, key concepts, and important facts
3. Convert statements into question-answer format when appropriate
4. Preserve the original meaning and context
5. Extract as many relevant flashcards as found (up to ${numberOfCards})
6. If the file contains multiple choice questions (marked with * for correct answers), extract them exactly
`
    : `
GENERATION RULES:
1. Create EXACTLY ${numberOfCards} flashcards, no more, no less
2. Generate questions based on the key concepts from the file
3. Focus on important information, definitions, and concepts
4. Create educational questions that test understanding
`
}

CRITICAL REQUIREMENTS:
- ANALYZE the actual file content to generate appropriate title and description
- Each flashcard should have a clear, concise question and comprehensive answer
- Include multiple choice options (4 choices per card)
- Only ONE correct answer per flashcard
- Provide detailed explanations for better understanding
- Generate relevant tags for each flashcard (3-5 tags per card)
- Response MUST be a valid JSON object

FORMAT:
{
  "title": "[AUTO-GENERATED title based on file content analysis]",
  "description": "[AUTO-GENERATED description based on file content analysis]",
  "selectedCategory": "${availableCategories ? "[Choose from available categories above]" : "General Knowledge"}",
  "flashcards": [
    {
      "id": "fc1",
      "question": "${isExtractMode ? "Extracted or converted question?" : "Generated question based on file content?"}",
      "difficulty": "${settings.difficulty || "EASY"}",
      "explanation": "Detailed explanation of the correct answer and why others are wrong",
      "tags": ["file-topic1", "concept-tag2", "difficulty-tag3"],
      "choices": [
        "Option A (incorrect)",
        "Option B (correct)",
        "Option C (incorrect)",
        "Option D (incorrect)"
      ],
      "correctAnswer": 1,
      "sourceFile": "${file.fileName}"${isExtractMode ? ',\n      "sourceContext": "Brief context from where this was extracted"' : ""}
    }
  ],
  "metadata": {
    "total_cards": ${numberOfCards},
    "difficulty": "${settings.difficulty || "EASY"}",
    "estimated_study_time": ${Math.ceil(numberOfCards * 0.5)},
    "generated_from": "file",
    "generation_mode": "${generationMode}"
  }
}

FLASHCARD BEST PRACTICES:
- Questions should be specific and unambiguous
- Avoid overly complex or trick questions
- Focus on one concept per flashcard
- Use active recall principles
- Include context when necessary for clarity
- Make explanations educational and helpful
- Ensure accuracy to the source material
- For multiple choice questions in source, preserve the original question structure

RETURN ONLY THE JSON OBJECT ABOVE.`.trim();

    console.log("🤖 Calling OpenRouter API...");
    // Call OpenRouter API
    const response = await axios.post(
      `${OPENROUTER_API_BASE}/chat/completions`,
      {
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        temperature: isExtractMode ? 0.2 : 0.3, // Lower temperature for extraction
        max_tokens: 4000,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://edumentum.vercel.app",
          "X-Title": `Edumentum Flashcard ${isExtractMode ? "Extractor" : "Generator"}`,
        },
        timeout: 90000,
      },
    );

    console.log("✅ OpenRouter API call successful");
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
      title: parsed.title || "AI Generated Flashcards",
      description:
        parsed.description || "Flashcards generated from uploaded file",
      flashcards: parsed.flashcards,
      metadata: parsed.metadata || {
        total_cards: parsed.flashcards.length,
        difficulty: settings.difficulty || "EASY",
        estimated_study_time: Math.ceil(parsed.flashcards.length * 0.5),
        generated_from: "file",
        generation_mode: generationMode,
      },
      selectedCategory: parsed.selectedCategory || null,
      mode: generationMode,
      sourceFile: file.fileName,
      processedCount: parsed.flashcards.length,
    });
  } catch (error) {
    console.error("Generate flashcards from file API error:", error);

    let errorMessage = "Failed to process file for flashcards";
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

    console.error("❌ API Error:", errorMessage, error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
