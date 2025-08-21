import {
  extractQuestions,
  extractQuestionsWithAI,
  generateQuestions,
  generateQuestionsFromFile,
  generateQuizTitleDescription as generateTitleDescriptionService,
} from "@/lib/services/ai-llm.service";
import { fileToAIService } from "@/lib/services/file-to-ai.service";
import {
  QuizProcessingError,
  withErrorHandling,
} from "@/lib/utils/quiz-errors";
import {
  extractSettingsForAI,
  extractSettingsForExtraction,
  mergeWithDefaults,
} from "@/lib/utils/quiz-settings";
import {
  sanitizeQuestions,
  validateQuizContent,
} from "@/lib/utils/quiz-validation";
import type { QuestionData } from "@/types/quiz";

export const generateQuizFromContent = async (
  content: string,
  sourceFiles: string[] = ["unknown"],
  settings?: any,
): Promise<any> => {
  return withErrorHandling(async () => {
    // Validate content
    const contentValidation = validateQuizContent(content);
    if (!contentValidation.isValid) {
      throw new QuizProcessingError(
        `Content validation failed: ${contentValidation.errors.join(", ")}`,
        "content_validation",
      );
    }

    // Normalize and merge settings with defaults
    const isExtractMode = settings?.generationMode === "EXTRACT";
    const normalizedSettings = mergeWithDefaults(
      settings,
      isExtractMode ? "EXTRACT" : "GENERATE",
    );

    let questions: QuestionData[] = [];

    // Generate questions based on mode
    if (isExtractMode) {
      if (normalizedSettings.useAI) {
        const aiSettings = extractSettingsForAI(normalizedSettings);
        questions = await extractQuestionsWithAIHandler(
          content,
          undefined,
          aiSettings,
        );
      } else {
        const extractSettings =
          extractSettingsForExtraction(normalizedSettings);
        questions = await extractQuestionsFromContent(content, extractSettings);
      }
    } else {
      const aiSettings = extractSettingsForAI(normalizedSettings);
      questions = await generateQuestionsWithAI(content, undefined, aiSettings);
    }

    if (questions.length === 0) {
      throw new QuizProcessingError(
        "No questions generated",
        "question_generation",
      );
    }

    // Sanitize questions
    questions = sanitizeQuestions(questions);

    // Generate smart title and description
    let title = `Quiz from ${sourceFiles[0]}`;
    let description = `${isExtractMode ? "Extracted" : "Generated"} ${questions.length} questions`;

    try {
      const titleDesc = await generateQuizTitleDescription(
        content.slice(0, 1000),
        questions,
        {
          isExtractMode,
          targetLanguage: normalizedSettings.language || "vi",
          filename: sourceFiles[0],
        },
      );

      if (titleDesc) {
        title = titleDesc.title || title;
        description = titleDesc.description || description;
      }
    } catch (titleError) {
      console.warn("Failed to generate AI title/description:", titleError);
    }

    // Collect unique tags from questions
    const allTags = questions
      .flatMap((q) => q.tags || [])
      .filter((tag, index, arr) => arr.indexOf(tag) === index)
      .slice(0, 10);

    // Create quiz data
    return {
      title,
      description,
      questions,
      metadata: {
        total_questions: questions.length,
        total_points: questions.reduce((sum, q) => sum + (q.points || 1), 0),
        estimated_time: Math.max(5, Math.ceil(questions.length * 1.5)),
        tags: allTags,
      },
    };
  }, "generateQuizFromContent");
};

export const generateQuizTitleDescription = async (
  content: string,
  questions: QuestionData[],
  options?: {
    isExtractMode?: boolean;
    targetLanguage?: string;
    filename?: string;
    category?: string;
    tags?: string[];
  },
): Promise<{ title: string; description: string } | null> => {
  try {
    const result = await generateTitleDescriptionService({
      content,
      questions,

      isExtractMode: options?.isExtractMode ?? false,
      targetLanguage: options?.targetLanguage || "auto",
      filename: options?.filename,
      category: options?.category,
      tags: options?.tags,
    });

    if (result.success && result.title && result.description) {
      return {
        title: result.title,
        description: result.description,
      };
    }
    return null;
  } catch (error) {
    console.warn("Failed to generate title/description:", error);
    return null;
  }
};

// Orchestration function for direct question extraction (NO AI)
export const extractQuestionsFromContent = async (
  content: string,
  settings?: any,
): Promise<QuestionData[]> => {
  console.log(" Extracting questions from file content (direct parsing)...");

  const extractSettings = extractSettingsForExtraction(settings);
  const result = await extractQuestions({
    fileContent: content,
    settings: extractSettings,
  });

  if (!result.success || !result.questions) {
    throw new Error(result.error || "Failed to extract questions from content");
  }

  console.log(` Successfully extracted ${result.questions.length} questions`);
  return result.questions;
};

// Orchestration function for AI-based question extraction
export const extractQuestionsWithAIHandler = async (
  content: string,
  actualFile?: File,
  settings?: any,
): Promise<QuestionData[]> => {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured");
  }

  const aiSettings = extractSettingsForAI(settings);
  const isDirectMode =
    settings?.fileProcessingMode === "SEND_DIRECT" && actualFile;
  let useDirectMode = false;

  if (isDirectMode) {
    const validation = fileToAIService.validateFileForAI(actualFile);
    if (validation.valid) {
      useDirectMode = true;
    }
  }

  try {
    let result: {
      success: boolean;
      questions?: QuestionData[];
      error?: string;
    };

    if (useDirectMode && actualFile) {
      const fileForAI = await fileToAIService.convertFileToAI(actualFile);
      result = await extractQuestionsWithAI({
        questionHeader: "Extract Quiz Questions",
        questionDescription:
          "Extract existing quiz questions from the provided file.",
        apiKey,
        file: fileForAI,
        settings: aiSettings,
        useMultiAgent: aiSettings.useMultiAgent,
      });
    } else {
      result = await extractQuestionsWithAI({
        questionHeader: "Extract Quiz Questions",
        questionDescription:
          "Extract existing quiz questions from the provided content.",
        apiKey,
        fileContent: content,
        settings: aiSettings,
        useMultiAgent: aiSettings.useMultiAgent,
      });
    }

    if (!result.success || !result.questions || result.questions.length === 0) {
      throw new Error(result.error || "No questions could be extracted");
    }

    const validQuestions = result.questions.filter(
      (q: QuestionData) =>
        q.question?.trim() && q.answers && q.answers.length > 0,
    );

    if (validQuestions.length === 0) {
      throw new Error("Extracted questions are invalid or empty");
    }
    return validQuestions;
  } catch (error) {
    console.error("❌ AI extraction failed:", error);
    throw error;
  }
};

export const generateQuestionsWithAI = async (
  content: string,
  actualFile?: File,
  settings?: any,
): Promise<QuestionData[]> => {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenRouter API key not configured");
  }

  const aiSettings = extractSettingsForAI(settings);
  const isDirectMode =
    settings?.fileProcessingMode === "SEND_DIRECT" && actualFile;
  let useDirectMode = false;

  if (isDirectMode) {
    const validation = fileToAIService.validateFileForAI(actualFile);
    if (validation.valid) {
      useDirectMode = true;
    }
  }

  try {
    let result: {
      success: boolean;
      questions?: QuestionData[];
      error?: string;
    };

    if (useDirectMode && actualFile) {
      const fileForAI = await fileToAIService.convertFileToAI(actualFile);
      result = await generateQuestionsFromFile({
        questionHeader: "Generate Quiz Questions",
        questionDescription:
          "Generate new quiz questions from the provided file.",
        apiKey,
        file: fileForAI,
        settings: aiSettings,
        useMultiAgent: aiSettings.useMultiAgent,
      });
    } else {
      result = await generateQuestions({
        questionHeader: "Generate Quiz Questions",
        questionDescription:
          "Generate new quiz questions from the provided content.",
        apiKey,
        fileContent: content,
        settings: aiSettings,
        useMultiAgent: aiSettings.useMultiAgent,
      });
    }

    if (!result.success || !result.questions || result.questions.length === 0) {
      throw new Error(result.error || "No questions could be generated");
    }

    const validQuestions = result.questions.filter(
      (q: QuestionData) =>
        q.question?.trim() && q.answers && q.answers.length > 0,
    );

    if (validQuestions.length === 0) {
      throw new Error("Generated questions are invalid or empty");
    }

    const expectedCount = aiSettings.numberOfQuestions;
    if (validQuestions.length < expectedCount) {
      console.warn(
        `⚠️ Got ${validQuestions.length}/${expectedCount} questions. Returning partial results.`,
      );
    }
    return validQuestions;
  } catch (error) {
    console.error("❌ AI generation failed:", error);
    throw error;
  }
};
