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
      console.log("📄 Using direct file mode for:", actualFile.name);
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
      console.log("📝 Using text content mode");
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

    // Validate flashcard structure
    const validFlashcards = result.flashcards.filter(
      (fc: FlashcardData) =>
        fc.question?.trim() && fc.choices && fc.choices.length > 0,
    );

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

    // Validate flashcard structure
    const validFlashcards = result.flashcards.filter(
      (fc: FlashcardData) =>
        fc.question?.trim() && fc.choices && fc.choices.length > 0,
    );

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
