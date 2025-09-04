import {
  extractFlashcardsWithAI,
  generateFlashcards,
  generateFlashcardsFromFile,
  generateFlashcardTitleDescription as generateTitleDescriptionService,
} from "@/lib/services/ai-flashcard.service";
import { fileToAIService } from "@/lib/services/file-to-ai.service";
import type { FlashcardData } from "@/types/flashcard";

// Orchestration function for flashcard title/description generation
export const generateFlashcardTitleDescription = async (
  content: string,
  flashcards: FlashcardData[],
  options?: {
    isExtractMode?: boolean;
    targetLanguage?: string;
    filename?: string;
    category?: string;
    tags?: string[];
  },
): Promise<{ title: string; description: string } | null> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not configured");
    }

    const result = await generateTitleDescriptionService({
      content,
      flashcards,
      isExtractMode: options?.isExtractMode ?? false,
      targetLanguage: options?.targetLanguage || "auto",
      filename: options?.filename,
      category: options?.category,
      tags: options?.tags,
      apiKey,
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

// Orchestration function for AI-based flashcard generation
export const generateFlashcardsWithAI = async (
  content: string,
  actualFile?: File,
  settings?: {
    fileProcessingMode?: "PARSE_THEN_SEND" | "SEND_DIRECT";
    visibility?: string;
    language?: string;
    numberOfCards?: number;
    difficulty?: string;
    generationMode?: "GENERATE" | "EXTRACT";
    flashcardType?: "QUESTIONS" | "VOCABULARY";
    categoryId?: number;
    fileProcessing?: string;
    parsingMode?: string;
    includeCategories?: boolean;
  },
): Promise<{
  id: string;
  title: string;
  description: string;
  metadata?: any;
  flashcards: FlashcardData[];
  createdAt: Date;
  updatedAt: Date;
}> => {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenRouter API key not configured");
  }

  // Validate and sanitize content input
  const safeContent = typeof content === "string" ? content.trim() : "";

  // If no content and no file, throw error
  if (!safeContent && !actualFile) {
    throw new Error(
      "Either content or file must be provided for flashcard generation",
    );
  }

  // Check if this is vocabulary flashcard generation
  if (settings?.flashcardType === "VOCABULARY") {
    const response = await fetch("/api/ai/generate-vocabulary-flashcards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Generated Vocabulary Flashcards",
        description: "AI-generated vocabulary flashcards from your content",
        categoryId: settings.categoryId,
        apiKey: apiKey,
        fileContent: safeContent,
        modelName: "google/gemini-2.0-flash-exp:free",
        settings: {
          language: settings.language || "auto",
          numberOfCards: Number(settings.numberOfCards) || 10,
          difficulty: settings.difficulty || "EASY",
          generationMode: settings.generationMode || "GENERATE",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Failed to generate vocabulary flashcards",
      );
    }

    const vocabularyResult = await response.json();

    // The API now returns flashcards directly with title/description included
    const flashcards = (
      vocabularyResult.flashcards ||
      vocabularyResult.vocabulary ||
      []
    ).map((item: any, index: number) => ({
      id: `vocab-${Date.now()}-${index}`,
      vocabulary: item.vocabulary,
      meaning: item.meaning,
      example: item.example,
      explanation: item.explanation,
    }));

    return {
      id: crypto.randomUUID(),
      title: vocabularyResult.title || "Vocabulary Flashcards",
      description:
        vocabularyResult.description ||
        `Generated ${flashcards.length} vocabulary flashcards`,
      flashcards,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Continue with existing logic for QUESTIONS type
  // Determine processing mode
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
      flashcards?: FlashcardData[];
      title?: string;
      description?: string;
      metadata?: any;
      selectedCategory?: string;
      error?: string;
    };

    if (useDirectMode && actualFile) {
      const fileForAI = await fileToAIService.convertFileToAI(actualFile);
      result = await generateFlashcardsFromFile({
        title: "Generated Flashcards",
        description: "Generated new Flashcards from the provided file.",
        apiKey,
        file: fileForAI,
        settings: {
          ...settings,
          numberOfCards: Number(settings?.numberOfCards) || 5,
          includeCategories: true,
        },
      });
    } else {
      result = await generateFlashcards({
        title: "AI Generated Flashcards",
        description: "Flashcards generated from the provided content.",
        apiKey,
        fileContent: safeContent,
        settings: {
          ...settings,
          numberOfCards: Number(settings?.numberOfCards) || 5,
          includeCategories: true,
        },
      });
    }

    if (
      !result.success ||
      !result.flashcards ||
      result.flashcards.length === 0
    ) {
      throw new Error(result.error || "No flashcards could be generated");
    }

    // Validate flashcard structure - support both questions and vocabulary formats
    const validFlashcards = result.flashcards.filter((fc: FlashcardData) => {
      // Check if it's a vocabulary flashcard
      if (fc.vocabulary) {
        return fc.vocabulary.trim() && fc.meaning?.trim();
      }
      // Check if it's a questions flashcard
      return fc.question?.trim() && fc.choices && fc.choices.length > 0;
    });

    if (validFlashcards.length === 0) {
      throw new Error("Generated flashcards are invalid or empty");
    }

    const expectedCount = settings?.numberOfCards || 5;
    if (validFlashcards.length < expectedCount) {
      console.warn(
        `⚠️ Got ${validFlashcards.length}/${expectedCount} flashcards. Returning partial results.`,
      );
    }

    // Return format compatible with existing code
    return {
      id: crypto.randomUUID(),
      title: result.title || "AI Generated Flashcards",
      description: result.description || "Flashcards generated by AI",
      metadata: result.metadata,
      flashcards: validFlashcards,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("❌ AI flashcard generation failed:", error);
    throw error;
  }
};

// Orchestration function for AI-based flashcard extraction
export const extractFlashcardsWithAIHandler = async (
  content: string,
  actualFile?: File,
  settings?: {
    fileProcessingMode?: "PARSE_THEN_SEND" | "SEND_DIRECT";
    visibility?: string;
    language?: string;
    numberOfCards?: number;
    difficulty?: string;
    generationMode?: "GENERATE" | "EXTRACT";
    flashcardType?: "QUESTIONS" | "VOCABULARY";
    categoryId?: number;
    fileProcessing?: string;
    parsingMode?: string;
    includeCategories?: boolean;
  },
): Promise<{
  flashcards: FlashcardData[];
  title: string;
  description: string;
  metadata?: any;
}> => {
  const apiKey =
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
    localStorage.getItem("openrouter_api_key");
  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured");
  }

  // Check if this is vocabulary flashcard extraction
  if (settings?.flashcardType === "VOCABULARY") {
    const response = await fetch("/api/ai/generate-vocabulary-flashcards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Extracted Vocabulary Flashcards",
        description: "AI-extracted vocabulary flashcards from your content",
        categoryId: settings.categoryId,
        apiKey: apiKey,
        fileContent: content,
        modelName: "google/gemini-2.0-flash-exp:free",
        settings: {
          language: settings.language || "auto",
          numberOfCards: Number(settings.numberOfCards) || 10,
          difficulty: settings.difficulty || "EASY",
          generationMode: "EXTRACT",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Failed to extract vocabulary flashcards",
      );
    }

    const vocabularyResult = await response.json();

    // The API now returns flashcards directly with title/description included
    const flashcards = (
      vocabularyResult.flashcards ||
      vocabularyResult.vocabulary ||
      []
    ).map((item: any, index: number) => ({
      id: `vocab-ext-${Date.now()}-${index}`,
      vocabulary: item.vocabulary,
      meaning: item.meaning,
      example: item.example,
      explanation: item.explanation,
    }));

    return {
      flashcards,
      title: vocabularyResult.title || "Extracted Vocabulary Flashcards",
      description:
        vocabularyResult.description ||
        `Extracted ${flashcards.length} vocabulary flashcards`,
    };
  }

  // Continue with existing logic for QUESTIONS type
  // Determine processing mode
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
      flashcards?: FlashcardData[];
      title?: string;
      description?: string;
      metadata?: any;
      selectedCategory?: string;
      error?: string;
    };

    if (useDirectMode && actualFile) {
      const fileForAI = await fileToAIService.convertFileToAI(actualFile);
      result = await extractFlashcardsWithAI({
        title: "Extracted Flashcards",
        description: "Flashcards extracted from uploaded file",
        apiKey,
        file: fileForAI,
        settings: {
          ...settings,
          generationMode: "EXTRACT",
          includeCategories: true,
        },
      });
    } else {
      result = await extractFlashcardsWithAI({
        title: "Extracted Flashcards",
        description: "Flashcards extracted from content",
        apiKey,
        fileContent: content,
        settings: {
          ...settings,
          generationMode: "EXTRACT",
          includeCategories: true,
        },
      });
    }

    if (
      !result.success ||
      !result.flashcards ||
      result.flashcards.length === 0
    ) {
      throw new Error(result.error || "No flashcards could be extracted");
    }

    // Validate flashcard structure - support both questions and vocabulary formats
    const validFlashcards = result.flashcards.filter((fc: FlashcardData) => {
      // Check if it's a vocabulary flashcard
      if (fc.vocabulary) {
        return fc.vocabulary.trim() && fc.meaning?.trim();
      }
      // Check if it's a questions flashcard
      return fc.question?.trim() && fc.choices && fc.choices.length > 0;
    });

    if (validFlashcards.length === 0) {
      throw new Error("Extracted flashcards are invalid or empty");
    }

    return {
      flashcards: validFlashcards,
      title: result.title || "Extracted Flashcards",
      description: result.description || "Flashcards extracted by AI",
      metadata: result.metadata,
    };
  } catch (error) {
    console.error("❌ AI flashcard extraction failed:", error);
    throw error;
  }
};
