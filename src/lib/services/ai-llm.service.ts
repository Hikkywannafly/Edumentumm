import type { Difficulty, QuestionData } from "@/types/quiz";
import { z } from "zod";
import { categoriesService } from "./categories.service";
import { ContentExtractor } from "./content-extractor.service";
import type { FileForAI } from "./file-to-ai.service";

const inFlight = new Map<string, Promise<AIResponse>>();

// Strong hash key generation using crypto-like approach
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
    targetLanguage = "vi",
    filename,
    category,
    tags,
    modelName = DEFAULT_MODEL,
  } = params;

  try {
    const result = await callServerAPI("generate-title-description", {
      content,
      questions: questions.map((q) => ({ question: q.question, type: q.type })),
      isExtractMode,
      targetLanguage,
      filename,
      category,
      tags,
      modelName,
    });

    if (!result.success || !result.title || !result.description) {
      throw new Error(result.error || "Failed to generate title/description");
    }

    return {
      success: true,
      title: result.title,
      description: result.description,
    };
  } catch (error) {
    console.warn("AI title/description generation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
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

      // Get available categories for AI selection if enabled
      let availableCategories = "";
      if (settings.includeCategories !== false) {
        try {
          availableCategories = await categoriesService.getCategoriesForAI();
        } catch (error) {
          console.warn("Failed to fetch categories for AI:", error);
          availableCategories = "No categories available";
        }
      }

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

      const questions = parseAIResponse(
        JSON.stringify({ questions: result.questions }),
      );

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
