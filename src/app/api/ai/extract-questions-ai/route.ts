import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ExtractQuestionsRequestSchema = z.object({
  questionHeader: z.string(),
  questionDescription: z.string(),
  apiKey: z.string(),
  fileContent: z.string().optional(),
  modelName: z.string().default("openai/gpt-oss-20b:free"),
  availableCategories: z.string().optional(),
  settings: z
    .object({
      language: z.string().optional(),
      questionType: z.string().optional(),
      numberOfQuestions: z.number().int().min(1).max(10).optional(),
      mode: z.enum(["exact", "max"]).optional(),
      difficulty: z.string().optional(),
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
    const validated = ExtractQuestionsRequestSchema.safeParse(body);

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
      fileContent,
      modelName,
      availableCategories = "",
      settings = {},
      file,
    } = validated.data;
    const numberOfQuestions = settings.numberOfQuestions || 10;
    const questionType = settings.questionType || "MIXED";

    // Build category selection instructions
    const categoryInstructions = availableCategories
      ? `\n\nCATEGORY SELECTION:\n${availableCategories}\n\nIMPORTANT: You MUST select exactly ONE category from the list above that best matches the extracted quiz content. Include it in the response as "selectedCategory": "Category Name".`
      : "";

    const prompt = `
You are an expert quiz extractor. You need to EXTRACT all existing questions from the provided content.

REQUIREMENTS:
- Header: ${questionHeader}
- Description: ${questionDescription}
- Language: ${settings.language || "AUTO"}
- Question Type: ${questionType}
- Maximum: ${numberOfQuestions} questions${categoryInstructions}

TASK: EXTRACT (do not create new) existing questions and answers from the content.

CRITICAL RULES:
1. ONLY extract questions that ALREADY EXIST, DO NOT create new questions
2. Preserve original question and answer content from source
3. Only ONE correct answer per question (except free response)
4. Generate relevant tags based on the extracted content (3-5 tags per question)
5. Response MUST be a valid JSON object with format {"questions": [...], "selectedCategory": "..."}
6. If no existing questions found, return {"questions": [], "selectedCategory": null}
7. ESCAPE ALL QUOTES AND SPECIAL CHARACTERS PROPERLY IN JSON
8. DO NOT include any markdown formatting or code blocks
9. RETURN ONLY THE JSON OBJECT, NO OTHER TEXT

FORMAT:
{
  "selectedCategory": "${availableCategories ? "[Choose from available categories above]" : null}",
  "questions": [
    {
      "id": "uuid-v4-format-id",
      "question": "Extracted question verbatim",
      "type": "MULTIPLE_CHOICE",
      "difficulty": "${settings.difficulty || "EASY"}",
      "points": 1,
      "explanation": "Explanation if available in source, or brief explanation",
      "tags": ["extracted-tag1", "topic-tag2", "content-tag3"],
      "answers": [
        {"id": "uuid-v4-format-id", "text": "Answer A", "isCorrect": false, "order_index": 0},
        {"id": "uuid-v4-format-id", "text": "Answer B", "isCorrect": true, "order_index": 1},
        {"id": "uuid-v4-format-id", "text": "Answer C", "isCorrect": false, "order_index": 2},
        {"id": "uuid-v4-format-id", "text": "Answer D", "isCorrect": false, "order_index": 3}
      ]
    }
  ]
}

IMPORTANT: ONLY EXTRACT existing questions. If no quiz format found, return {"questions": [], "selectedCategory": null}. Return ONLY the JSON object, no additional text.`.trim();

    let finalPrompt = prompt;
    const messageContent: any[] = [{ type: "text", text: prompt }];

    // Handle file content
    if (file) {
      if (file.type === "image") {
        messageContent.push({
          type: "image_url",
          image_url: { url: `data:${file.mimeType};base64,${file.data}` },
        });
      } else {
        finalPrompt += `\n\nFile: ${file.fileName} (${file.mimeType})\nContent: ${file.data.slice(0, 8000)}`;
      }
    } else if (fileContent) {
      finalPrompt += `\n\nContent to extract from:\n${fileContent.slice(0, 8000)}`;
    }

    // Call OpenRouter API
    const response = await axios.post(
      `${OPENROUTER_API_BASE}/chat/completions`,
      {
        model: modelName,
        messages:
          file?.type === "image"
            ? [{ role: "user", content: messageContent }]
            : [{ role: "user", content: finalPrompt }],
        temperature: 0.1, // Low temperature for consistent JSON extraction
        max_tokens: 4000,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://edumentum.vercel.app",
          "X-Title": "Edumentum Quiz Extractor",
        },
        timeout: 90000,
      },
    );

    const aiResponse = response.data.choices?.[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No content returned from AI");
    }

    // Clean and parse AI response with robust error handling
    let parsed: any;
    try {
      // Clean the response by removing any potential markdown formatting
      let cleanedResponse = aiResponse.trim();

      // Remove markdown code blocks if present
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "");
      } else if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse
          .replace(/^```\s*/, "")
          .replace(/\s*```$/, "");
      }

      // Try to find JSON object boundaries
      const jsonStart = cleanedResponse.indexOf("{");
      const jsonEnd = cleanedResponse.lastIndexOf("}");

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.slice(jsonStart, jsonEnd + 1);
      }

      // Attempt to parse the cleaned JSON
      parsed = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw AI Response:", aiResponse);

      // Try to extract JSON from the response using regex as fallback
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No valid JSON found in AI response");
        }
      } catch (fallbackError) {
        console.error("Fallback JSON Parse Error:", fallbackError);
        throw new Error(
          `Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : "Unknown parsing error"}`,
        );
      }
    }
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return NextResponse.json({
        success: true,
        questions: [], // Return empty array if no questions found
        selectedCategory: null,
      });
    }

    return NextResponse.json({
      success: true,
      questions: parsed.questions,
      selectedCategory: parsed.selectedCategory || null,
    });
  } catch (error) {
    console.error("Extract questions API error:", error);

    let errorMessage = "Failed to extract questions";
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
