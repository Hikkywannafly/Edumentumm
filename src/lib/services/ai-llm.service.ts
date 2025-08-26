import type { Difficulty, QuestionData } from "@/types/quiz";
import { z } from "zod";
import { ContentExtractor } from "./content-extractor.service";
import type { FileForAI } from "./file-to-ai.service";

const inFlight = new Map<string, Promise<AIResponse>>();

function makeRequestKey(
  content: string,
  model: string,
  settings?: any,
): string {
  const raw = JSON.stringify({
    content: content.slice(0, 2000), // Increased for better uniqueness
    model,
    settings,
    timestamp: Math.floor(Date.now() / 60000), // 1-minute cache window
  });

  // FNV-1a hash with better distribution
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = (hash * 16777619) >>> 0; // Use prime multiplier
  }

  // Add content length and model as additional entropy
  hash ^= content.length;
  hash ^= model.length << 8;

  return `${hash.toString(36)}-${Date.now().toString(36)}`;
}

// Zod schemas for validation
const AnswerSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  isCorrect: z.boolean(),
  order_index: z.number().int().min(0),
  explanation: z.string().optional(),
});

const QuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  type: z.enum([
    "MULTIPLE_CHOICE",
    "TRUE_FALSE",
    "FILL_BLANK",
    "FREE_RESPONSE",
  ]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  points: z.number().int().min(1).default(1),
  explanation: z.string().default(""),
  tags: z.array(z.string()).default([]),
  answers: z.array(AnswerSchema),
  shortAnswerText: z.string().optional(),
});

const AIResponseSchema = z.object({
  questions: z.array(QuestionSchema),
});

// Server-side only constants
const DEFAULT_MODEL = "google/gemini-2.5-flash-lite";

// Drop-in utility functions
function validateQuestionCount(
  questions: any[],
  expectedCount: number,
  mode: "exact" | "max",
): boolean {
  if (mode === "exact") {
    return questions.length === expectedCount;
  }
  return questions.length <= expectedCount && questions.length > 0;
}

function ensureCorrectAnswers(questions: QuestionData[]): QuestionData[] {
  return questions.map((q) => {
    if (q.type === "FREE_RESPONSE") {
      return { ...q, answers: [] };
    }

    // Ensure at least one correct answer exists
    const hasCorrect = q.answers.some((a) => a.isCorrect);
    if (!hasCorrect && q.answers.length > 0) {
      q.answers[0].isCorrect = true;
    }

    // Ensure only one correct answer for non-multiple-select types
    if (
      q.type !== "MULTIPLE_CHOICE" ||
      q.answers.filter((a) => a.isCorrect).length > 1
    ) {
      q.answers.forEach((a, i) => {
        a.isCorrect = i === q.answers.findIndex((ans) => ans.isCorrect);
      });
    }

    return q;
  });
}

// Utility functions for ID generation
export function generateQuestionId(): string {
  return `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateAnswerId(
  questionIndex: number,
  answerIndex: number,
): string {
  return `a-${Date.now()}-${questionIndex}-${answerIndex}`;
}

// Extract topics from content and questions for better fallback titles
function extractTopicsFromContent(
  content: string,
  questions: QuestionData[],
): string | null {
  try {
    // Extract topics from question tags first
    const questionTags = questions
      .flatMap((q) => q.tags || [])
      .filter((tag, index, arr) => arr.indexOf(tag) === index)
      .slice(0, 3);

    if (questionTags.length > 0) {
      return questionTags.join(", ");
    }

    // Extract topics from content using keyword detection
    const topicKeywords = [
      // Vietnamese topics
      {
        keywords: ["toán", "học", "số", "hàm", "đạo hàm", "giải tích"],
        topic: "Toán học",
      },
      {
        keywords: ["lịch sử", "việt nam", "kháng chiến", "chiến tranh"],
        topic: "Lịch sử",
      },
      { keywords: ["vật lý", "điện", "quang học", "cơ học"], topic: "Vật lý" },
      {
        keywords: ["hóa học", "phản ứng", "nguyên tố", "phân tử"],
        topic: "Hóa học",
      },
      {
        keywords: ["sinh học", "tế bào", "di truyền", "động vật"],
        topic: "Sinh học",
      },
      {
        keywords: ["tiếng anh", "english", "grammar", "vocabulary"],
        topic: "Tiếng Anh",
      },
      { keywords: ["ngữ văn", "văn học", "thơ", "truyện"], topic: "Ngữ văn" },
      {
        keywords: ["tin học", "lập trình", "computer", "programming"],
        topic: "Tin học",
      },

      // English topics
      {
        keywords: ["mathematics", "algebra", "calculus", "geometry"],
        topic: "Mathematics",
      },
      {
        keywords: ["history", "historical", "war", "civilization"],
        topic: "History",
      },
      {
        keywords: ["physics", "mechanics", "optics", "electricity"],
        topic: "Physics",
      },
      {
        keywords: ["chemistry", "reaction", "molecule", "element"],
        topic: "Chemistry",
      },
      {
        keywords: ["biology", "cell", "genetics", "organism"],
        topic: "Biology",
      },
      {
        keywords: ["literature", "poetry", "novel", "writing"],
        topic: "Literature",
      },
      {
        keywords: ["science", "scientific", "research", "experiment"],
        topic: "Science",
      },
      {
        keywords: ["technology", "computer", "software", "programming"],
        topic: "Technology",
      },
    ];

    const contentLower = content.toLowerCase();
    for (const { keywords, topic } of topicKeywords) {
      if (
        keywords.some((keyword) => contentLower.includes(keyword.toLowerCase()))
      ) {
        return topic;
      }
    }

    return null;
  } catch (error) {
    console.warn("Failed to extract topics:", error);
    return null;
  }
}

// Consolidated interface for all AI operations
interface AIQuizParams {
  questionHeader: string;
  questionDescription: string;
  apiKey: string;
  fileContent?: string;
  modelName?: string;
  settings?: any; // Flexible to accept any settings structure
  file?: FileForAI;
  useMultiAgent?: boolean;
}

// Simple extraction params
interface ExtractQuestionsParams {
  fileContent: string;
  settings?: any; // Flexible settings
}

// Use QuizProcessingResult instead
export interface AIResponse {
  success: boolean;
  questions?: QuestionData[];
  error?: string;
}

// Server-side API call function
async function callServerAPI(
  endpoint: string,
  payload: any,
  signal?: AbortSignal,
): Promise<any> {
  try {
    // Check if we're running on server or client
    const isServer = typeof window === "undefined";

    if (isServer) {
      if (endpoint === "generate-questions-from-file") {
        const { POST } = await import(
          "@/app/api/ai/generate-questions-from-file/route"
        );
        const request = new Request(
          "http://localhost:3000/api/ai/generate-questions-from-file",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        const response = await POST(request as any);
        return await response.json();
      }

      if (endpoint === "generate-questions") {
        // Direct server-side implementation for generate-questions
        return await generateQuestionsServerSide(payload);
      }

      if (endpoint === "extract-questions-ai") {
        const { POST } = await import(
          "@/app/api/ai/extract-questions-ai/route"
        );
        const request = new Request(
          "http://localhost:3000/api/ai/extract-questions-ai",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        const response = await POST(request as any);
        return await response.json();
      }

      // For other endpoints, return mock data for now
      console.warn(
        `⚠️ Server-side AI call not implemented for endpoint: ${endpoint}`,
      );
      return {
        success: true,
        questions: [],
      };
    }

    // On client, use normal fetch with relative URL
    const response = await fetch(`/api/ai/${endpoint}`, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        handleServerAPIError(
          errorData.error || `Server error: ${response.status}`,
        ),
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Server API call to ${endpoint} failed:`, error);
    throw error;
  }
}

// Direct server-side implementation for generate-questions
async function generateQuestionsServerSide(payload: any): Promise<any> {
  try {
    const {
      questionHeader,
      questionDescription,
      apiKey,
      fileContent,
      modelName = DEFAULT_MODEL,
      settings = {},
    } = payload;

    const numberOfQuestions = settings.numberOfQuestions || 5;
    const questionType = settings.questionType || "MIXED";

    // Build AI prompt for content-based generation
    const prompt = `
You are an expert quiz generator. You MUST return EXACTLY ${numberOfQuestions} high-quality questions from the provided content.

REQUIREMENTS:
- Header: ${questionHeader}
- Description: ${questionDescription}
- Language: ${settings.language || "AUTO"}
- Question Type: ${questionType}
- Difficulty: ${settings.difficulty || "EASY"}
- Number of Questions: ${numberOfQuestions}

Content to analyze:
${fileContent}

CRITICAL RULES:
1. Return EXACTLY ${numberOfQuestions} questions, no more, no less
2. Each multiple choice question has 4 answers, true/false has 2 answers
3. Only ONE correct answer per question (except free response)
4. Generate creative and relevant tags for each question (3-5 tags per question)
5. Response MUST be a valid JSON object with format {"questions": [...]}
6. Analyze the entire content to create accurate questions

FORMAT:
{
  "questions": [
    {
      "id": "q1",
      "question": "Your question?",
      "type": "MULTIPLE_CHOICE",
      "difficulty": "${settings.difficulty || "EASY"}",
      "points": 1,
      "explanation": "Detailed explanation why this answer is correct and others are wrong",
      "tags": ["content-tag1", "topic-tag2", "subject-tag3"],
      "answers": [
        {"id": "a1", "text": "Option A", "isCorrect": false, "order_index": 0},
        {"id": "a2", "text": "Option B", "isCorrect": true, "order_index": 1},
        {"id": "a3", "text": "Option C", "isCorrect": false, "order_index": 2},
        {"id": "a4", "text": "Option D", "isCorrect": false, "order_index": 3}
      ]
    }
  ]
}

RETURN ONLY THE JSON OBJECT ABOVE.`.trim();

    // Make direct API call to OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://edumentum.vercel.app",
          "X-Title": "Edumentum Quiz Generator",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        }),
      },
    );

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

    console.log(
      `✅ Server-side generated ${parsed.questions.length} questions successfully`,
    );

    return {
      success: true,
      questions: parsed.questions,
    };
  } catch (error) {
    console.error("Server-side question generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Generate quiz title and description using AI (server-side API call)
export async function generateQuizTitleDescription(params: {
  content: string;
  questions: QuestionData[];
  isExtractMode?: boolean;
  targetLanguage?: string;
  filename?: string;
  category?: string;
  tags?: string[];
  modelName?: string;
}): Promise<{
  success: boolean;
  title?: string;
  description?: string;
  error?: string;
}> {
  const {
    content,
    questions,
    isExtractMode,
    targetLanguage = "auto",
    filename,
    category,
    tags,
    modelName = DEFAULT_MODEL,
  } = params;

  try {
    const apiKey =
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
      process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not configured");
    }

    // Prepare content for AI
    const contentPreview = content.slice(0, 1500);
    const questionSamples = questions
      .slice(0, 5)
      .map((q, i) => `${i + 1}. ${q.question}`)
      .join("\n");

    const contextInfo = [
      `Questions: ${questions.length}`,
      `Source: ${isExtractMode ? "Extracted from document" : "AI Generated"}`,
      filename ? `File: ${filename.replace(/\.[^/.]+$/, "")}` : "",
      category ? `Topic: ${category}` : "",
      tags && tags.length ? `Tags: ${tags.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    // Detect language (with targetLanguage as fallback preference)
    const vietnameseChars =
      /[ăâêôơưđàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    const isVietnamese =
      vietnameseChars.test(contentPreview) ||
      vietnameseChars.test(questionSamples) ||
      targetLanguage?.toLowerCase().includes("vi");

    const systemPrompt = `You are an expert quiz title and description generator. Your task is to analyze quiz content and create engaging, specific titles that reflect the actual subject matter.

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

    const userPrompt = `Analyze this quiz content and create a specific, engaging title and description:

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

    // Make direct API call to OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://edumentum.vercel.app",
          "X-Title": "Edumentum Quiz Title Generator",
        },
        body: JSON.stringify({
          model: modelName || "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 300,
          response_format: { type: "json_object" },
        }),
      },
    );

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

    // Parse AI response with fallback
    let parsedResult: { title?: string; description?: string } | null = null;
    try {
      // Clean the response
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

      parsedResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw AI response:", aiResponse);
      // Continue to fallback
    }

    if (parsedResult && parsedResult.title && parsedResult.description) {
      console.log("Successfully parsed AI response:", parsedResult);
      return {
        success: true,
        title: parsedResult.title,
        description: parsedResult.description,
      };
    }

    // Fallback to generate titles based on detected language and content
    const contentTopics = extractTopicsFromContent(contentPreview, questions);
    const fallbackTitle = filename
      ? isVietnamese
        ? `Bài kiểm tra: ${filename.replace(/\.[^/.]+$/, "")}`
        : `${filename.replace(/\.[^/.]+$/, "")} Quiz`
      : isVietnamese
        ? contentTopics
          ? `Bài kiểm tra: ${contentTopics}`
          : "Bài kiểm tra được tạo"
        : contentTopics
          ? `${contentTopics} Quiz`
          : "Generated Quiz";

    const fallbackDescription = isVietnamese
      ? `Bài kiểm tra với ${questions.length} câu hỏi${contentTopics ? ` về ${contentTopics.toLowerCase()}` : " về các chủ đề khác nhau"}`
      : `Quiz with ${questions.length} questions${contentTopics ? ` about ${contentTopics.toLowerCase()}` : " covering various topics"}`;

    console.log("Using fallback values:", {
      fallbackTitle,
      fallbackDescription,
    });

    return {
      success: true,
      title: fallbackTitle,
      description: fallbackDescription,
    };
  } catch (error) {
    console.error("Generate title/description error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: message,
    };
  }
}

// Enhanced error handling for server API calls
function handleServerAPIError(error: string): string {
  if (error.includes("fetch")) {
    return "Network error - please check your connection";
  }
  if (error.includes("timeout")) {
    return "Request timeout - please try again";
  }
  if (error.includes("API key")) {
    return "Invalid API key - please check your configuration";
  }
  return error || "Unknown server error";
}

// Drop-in parsing utility with Zod validation
function parseAIResponse(aiResponse: string): QuestionData[] {
  // Clean response
  const content = aiResponse
    .trim()
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```json\s*([\s\S]*?)\s*```/i, "$1")
    .replace(/```\s*([\s\S]*?)\s*```/i, "$1")
    .trim();

  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Parsing AI response:", content.substring(0, 500));
  }

  // Try direct JSON parse with Zod validation
  try {
    const parsed = JSON.parse(content);
    const validated = AIResponseSchema.safeParse(parsed);

    if (validated.success) {
      const questions = ensureCorrectAnswers(validated.data.questions);
      console.log(`✅ Zod validation success: ${questions.length} questions`);
      return questions;
    }
    console.warn("⚠️ Zod validation failed:", validated.error.issues);
  } catch (error) {
    console.warn("⚠️ Direct JSON parse failed:", error);
  }

  // Fallback: try to extract questions array
  try {
    const questionsMatch = content.match(/"questions"\s*:\s*\[([\s\S]*)/i);
    if (questionsMatch) {
      const questionsContent = `[${questionsMatch[1]}`;
      const lastBracket = questionsContent.lastIndexOf("]");
      if (lastBracket > 0) {
        const questionsArray = questionsContent.substring(0, lastBracket + 1);
        const parsed = JSON.parse(questionsArray);

        if (Array.isArray(parsed)) {
          // Validate each question individually
          const validQuestions: QuestionData[] = [];

          for (const q of parsed) {
            const validated = QuestionSchema.safeParse(q);
            if (validated.success) {
              validQuestions.push(validated.data);
            } else {
              console.warn(
                "⚠️ Invalid question skipped:",
                validated.error.issues,
              );
            }
          }

          if (validQuestions.length > 0) {
            const questions = ensureCorrectAnswers(validQuestions);
            console.log(
              `✅ Fallback parsing success: ${questions.length} questions`,
            );
            return questions;
          }
        }
      }
    }
  } catch (error) {
    console.warn("⚠️ Fallback parsing failed:", error);
  }

  console.error("❌ Failed to parse AI response");
  return [];
}

export function parseQuestionsFromAI(
  aiResponse: string,
  _settings?: any, // Deprecated parameter, kept for backward compatibility
): QuestionData[] {
  console.warn(
    "⚠️ Using deprecated parseQuestionsFromAI - migrate to parseAIResponse",
  );
  return parseAIResponse(aiResponse);
}

// Enhanced question processing with validation (deprecated - use Zod validation)
export function processQuestionArray(
  parsed: any[],
  settings?: any,
): QuestionData[] {
  console.warn(
    "⚠️ Using deprecated processQuestionArray - migrate to Zod validation",
  );

  return parsed.map((q, index) => {
    // Ensure answers are properly formatted
    const answers = Array.isArray(q.answers)
      ? q.answers.map((a: any, i: number) => ({
          id: a.id || generateAnswerId(index, i),
          text: a.text || `Option ${i + 1}`,
          isCorrect: !!a.isCorrect,
          order_index: i,
        }))
      : [];

    // Validate question structure - use settings for backward compatibility
    const question: QuestionData = {
      id: q.id || generateQuestionId(),
      question: q.question || `Question ${index + 1}`,
      type: q.type || "MULTIPLE_CHOICE",
      difficulty: (q.difficulty ||
        settings?.difficulty ||
        "EASY") as Difficulty,
      points: Math.max(1, q.points || 1),
      explanation: q.explanation || "",
      tags: Array.isArray(q.tags) ? q.tags : [],
      answers,
      shortAnswerText: q.shortAnswerText || "",
    };

    return question;
  });
}
// Extract questions from files with existing questions (NO AI, direct parsing)
export async function extractQuestions(
  params: ExtractQuestionsParams,
): Promise<AIResponse> {
  const { fileContent } = params;

  try {
    console.log(
      "🔍 Extracting questions from file content (direct text parsing)...",
    );
    console.log(
      "📄 File content to extract from:",
      `${fileContent.substring(0, 500)}...`,
    );

    const extractor = new ContentExtractor();
    const questions = extractor.extractQuestions(fileContent);

    if (questions.length === 0) {
      throw new Error(
        "No questions could be extracted from file content. Please ensure the file contains properly formatted questions and answers.",
      );
    }

    console.log(
      `✅ Successfully extracted ${questions.length} questions without modification`,
    );
    return {
      success: true,
      questions,
    };
  } catch (error) {
    console.error("❌ Question extraction failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
async function processQuestionsWithAI(
  endpoint: string,
  params: {
    questionHeader: string;
    questionDescription: string;
    apiKey: string;
    fileContent?: string;
    modelName?: string;
    settings: any; // Flexible settings to avoid TypeScript conflicts
    file?: FileForAI;
    defaultQuestionCount?: number;
    useExactMode?: boolean;
  },
  signal?: AbortSignal,
): Promise<AIResponse> {
  const {
    questionHeader,
    questionDescription,
    apiKey,
    fileContent = "",
    modelName = DEFAULT_MODEL,
    settings,
    file,
    defaultQuestionCount = 5,
    useExactMode = true,
  } = params;

  const requestKey = makeRequestKey(fileContent, modelName, settings);

  if (inFlight.has(requestKey)) {
    const existingPromise = inFlight.get(requestKey);
    if (existingPromise) {
      return existingPromise;
    }
  }

  const promise = (async (): Promise<AIResponse> => {
    try {
      const numberOfQuestions = Math.max(
        5,
        Math.min(
          10,
          settings.number_of_questions ||
            settings.numberOfQuestions ||
            defaultQuestionCount,
        ),
      );
      const mode =
        useExactMode &&
        (settings.number_of_questions || settings.numberOfQuestions)
          ? "exact"
          : "max";

      const availableCategories = "";

      const normalizedSettings = {
        ...settings,
        numberOfQuestions: numberOfQuestions,
        mode,
        parsingMode: settings.parsing_mode || settings.parsingMode,
        questionType: settings.question_type || settings.questionType,
      };

      const result = await callServerAPI(
        endpoint,
        {
          questionHeader,
          questionDescription,
          apiKey,
          fileContent,
          modelName,
          settings: normalizedSettings,
          file,
          availableCategories,
        },
        signal,
      );

      if (!result.success || !result.questions) {
        throw new Error(
          result.error || `Failed to ${endpoint.replace("-", " ")}`,
        );
      }

      // result.questions is already parsed from the API route, no need to parse again
      let questions: QuestionData[];

      if (Array.isArray(result.questions)) {
        // Validate each question with Zod
        const validQuestions: QuestionData[] = [];

        for (const q of result.questions) {
          const validated = QuestionSchema.safeParse(q);
          if (validated.success) {
            validQuestions.push(validated.data);
          } else {
            console.warn("⚠️ Invalid question skipped:", validated.error.issues);
          }
        }

        questions = ensureCorrectAnswers(validQuestions);
        console.log(
          `✅ Successfully processed ${questions.length} questions from API`,
        );
      } else {
        throw new Error("Invalid questions format from API");
      }

      if (!validateQuestionCount(questions, numberOfQuestions, mode)) {
        console.warn(
          `⚠️ Question count validation failed: got ${questions.length}, expected ${mode} ${numberOfQuestions}`,
        );
      }

      return { success: true, questions: ensureCorrectAnswers(questions) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      inFlight.delete(requestKey);
    }
  })();

  inFlight.set(requestKey, promise);
  return promise;
}

// Generate NEW questions using AI from content (server-side only)
export async function generateQuestions(
  params: AIQuizParams,
  signal?: AbortSignal,
): Promise<AIResponse> {
  return processQuestionsWithAI(
    "generate-questions",
    {
      ...params,
      settings: params.settings || {},
      defaultQuestionCount: 5,
      useExactMode: true,
    },
    signal,
  );
}

// Extract questions using AI (for content that already has quiz format)
export async function extractQuestionsWithAI(
  params: AIQuizParams,
): Promise<AIResponse> {
  return processQuestionsWithAI("extract-questions-ai", {
    ...params,
    settings: params.settings || {},
    defaultQuestionCount: 10,
    useExactMode: false, // Extraction allows up to N questions
  });
}

// Generate questions directly from file
export async function generateQuestionsFromFile(
  params: AIQuizParams & { file: FileForAI },
): Promise<AIResponse> {
  return processQuestionsWithAI("generate-questions-from-file", {
    ...params,
    settings: params.settings || {},
    defaultQuestionCount: 5,
    useExactMode: true,
  });
}
